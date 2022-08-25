function audioIssueBody(files: string[], meta: string): string {
  return `# Describe the problem:
## If an issue with audio please describe:
Is the problem with the Cherokee or English audio? 

What sounds wrong about the audio?
Eg. "Sounds like someone talking through a fan" or "Sounds like a robot."



## If an issue of grammar/correctness, please describe:  
Eg. \`di-\` prefix is used, but translation is singular.



## If an issue with syllabary, please describe:
Eg. English text in syllabary, or "Ꮝ" used for shorted "Ꮜ"


# DO NOT EDIT BELOW

Problematic audio:
- ${files.join("\n- ")}

Additional metadata:
\`\`\`json
${meta}
\`\`\`
`;
}

export function createIssueForAudioInNewTab(files: string[], meta: string) {
  const a = document.createElement("a");
  a.href = `https://github.com/CherokeeLanguage/online-exercises/issues/new?title=${encodeURIComponent(
    "Issue with term"
  )}&projects=CherokeeLanguage/1&labels=${encodeURIComponent(
    "content issue"
  )}&body=${encodeURIComponent(audioIssueBody(files, meta))}`;
  a.target = "_BLANK";
  a.click();
}
