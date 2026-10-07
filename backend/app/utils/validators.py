import re
from typing import Annotated

from pydantic import AfterValidator

_PHONE_RE = re.compile(r"^(?:\+91)?(\d{10})$")
PHONE_ERROR = "Phone must be a 10-digit number, optionally starting with +91"


def normalize_phone(value: str) -> str:
    match = _PHONE_RE.match(re.sub(r"[\s\-]", "", value))
    if not match:
        raise ValueError(PHONE_ERROR)
    return f"+91 {match.group(1)}"


Phone = Annotated[str, AfterValidator(normalize_phone)]
