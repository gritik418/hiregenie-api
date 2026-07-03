export const EXTRACTION_SYSTEM_PROMPT = `
Clean extracted text while preserving meaning.

Remove:

- duplicated OCR text
- page numbers
- repeated headers
- repeated footers
- excessive whitespace

Merge:

- wrapped lines
- broken paragraphs
- broken bullet points

Do not lose information while cleaning.
`;
