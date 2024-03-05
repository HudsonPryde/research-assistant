from flask import request, jsonify, Blueprint
import requests

from typing import List
from rich import print
import io
import cohere
import guardrails as gd
from guardrails.validators import ValidRange, ValidChoices, Validator
from pydantic import BaseModel, Field
from celery.result import AsyncResult
from . import tasks

bp = Blueprint("api", __name__, url_prefix="/api")

fields = [
        "title",
        "url",
        "abstract",
        "authors",
        "year",
        "referenceCount",
        "citationCount",
        "isOpenAccess",
        "openAccessPdf",
        "fieldsOfStudy",
        "embedding",
        "tldr"
    ]

@bp.post("/scholar")
def find_sources():
    body = request.json
    query = body['query']
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={query}&fields={(',').join(fields)}&limit=10&openAccessPdf"
    response = requests.get(url)
    sources = response.json().get('data', [])
    return jsonify(sources)

@bp.post("/support-claim")
def support_claim():
    body = request.json
    source = body['source']
    snippet = body['snippet']
    url = source['openAccessPdf']['url']
    result = tasks.support.delay(source, snippet, url)
    return {"result_id": result.id}

@bp.post("/result")
def task_result() -> dict[str, object]:
    tasks = request.json["tasks"]
    results = []
    for task in tasks:
        state = AsyncResult(task)
        results.append({
            "key": task, 
            "ready": state.ready(),
            "successful": state.successful(),
            "state": state.state,
            "value": state.get() if state.ready() else None,
        })
    return {"results": results}
    
class SearchTerm(BaseModel):
    snippet: str = Field(..., description="Claim that needs supporting evidence")
    terms: str = Field(..., description="A search query to find research related to the claim")


class TermGenResponse(BaseModel):
    """Final response for term gen"""
    result: List[SearchTerm] = Field(..., description="Snippets of the text that need supporting evidence")

@bp.post("/gen-terms")
def gen_terms():
    body = request.json
    text = body['text']
    PROMPT = """Given the following text, extract a dictionary that contains claims that need supporting evidence.
    ${text}

    ${gr.complete_json_suffix_v2}
    """
    guard = gd.Guard.from_pydantic(output_class=TermGenResponse, prompt=PROMPT, num_reasks=5)

    _, validated_output, *rest = guard(
        tasks.co.generate,
        prompt_params={"text": text},
        model='command',
        max_tokens=1024,
        temperature=0.6
    )

    return validated_output