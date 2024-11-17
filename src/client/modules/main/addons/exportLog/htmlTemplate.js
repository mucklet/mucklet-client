export const htmlStart = `<!doctype html><html lang="en">`;
export const headStart = `<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">`;
export const titleStart = `<title>`;
export const titleEnd = `</title>`;
export const styleStart = `<style>`;
export const styleEnd = `</style>`;
export const headEnd = `</head>`;
export const bodyStart = `<body><div class="cont">`;
export const bodyEnd = `</div></body>`;
export const htmlEnd = `</html>`;

export const style = `
body { font-family: "Open Sans", sans-serif; font-size: 16px; color: #7d818c; background-color: #161926; margin: 0; line-height: 1.4em; padding: 8px 16px; }
.cont {
	width: 100%;
	max-width: 720px;
	position: absolute;
    left: 50%;
    -moz-transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
}
.charlog--fieldset { position: relative; border: 1px solid #565961; padding: 6px 10px; border-radius: 8px; }
.charlog--fieldset-label { color: #7d818c; position: absolute; font-size: 12px; line-height: 10px; top: -6px; left: 16px; padding: 0 4px; background: #161926; }
.charlog--char { color: #6490a8; }
.charlog--default { color: #7d818c; }
.charlog--strong { color: #fffcf2; }
.charlog--cmd { color: #c1a657; }
.charlog--error { color: #9a593e; }
.charlog--listitem { color: #6490a8; }
.charlog--ooc { color: #565961; }
.charlog--tag { font-size: 12px; color: #7d818c; position: absolute; margin-left: -12px; margin-top: -12px; }
.charlog--pad-small { margin: 0; padding: 4px 0 2px 0; }
.charlog--pad { margin: 0; padding: 6px 0 3px 0; }
.charlog--pad-large { margin: 0; padding: 12px 0 6px 0; }
.common--formattext span.ooc { color: #565961; }
.common--formattext span.cmd { font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; color: #c1a657; }
.common--formattext a { color: #4a9fc3; transition: color 0.2s; text-decoration: none; }
.common--formattext a:hover { color: #69afcd; }
.common--formattext a:active { color: #87c0d7; }
`;
// For code formatting support, include:
// .charlog--code-simple { font-size: 14px; font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace; color: #c1a657; }
// .charlog--code, .charlog--code-inline { font-style: normal; font-size: 14px; padding: 6px 10px; background: #0f1119; border-radius: 8px; }
// .charlog--code p, .charlog--code-inline p { font-size: 14px; margin-bottom: 2px; }
// .charlog--code code, .charlog--code-inline code { font-size: 14px; font-family: Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace; color: #c1a657; }
// .charlog--code .opt::before, .charlog--code-inline .opt::before { content: "["; color: #565961; }
// .charlog--code .opt::after, .charlog--code-inline .opt::after { content: "]"; color: #565961; }
// .charlog--code .param, .charlog--code-inline .param { color: #6490a8; }
// .charlog--code .param::before, .charlog--code-inline .param::before { content: "<"; }
// .charlog--code .param::after, .charlog--code-inline .param::after { content: ">"; }
// .charlog--code .comment, .charlog--code-inline .comment { color: #7d818c; }
// .charlog--code sup, .charlog--code-inline sup { font-size: 75%; line-height: 0; position: relative; top: -0.5em; }

export const controlStyle = `font-size: 12px; padding: 9px 0 12px; line-height: 24px;`;
export const controlBorderStyle = `border-bottom: 1px solid #7d818c;`;
export const sayStyle = `white-space: pre-wrap; color: #a8abb2; padding: 6px 0 2px 0;`;
export const describeStyle = `font-size: 12px; white-space: pre-wrap; padding: 6px 0 2px 0;`;
export const infoStyle = `color: #565961; font-style: italic; padding-top: 4px;`;
export const whisperStyle = `white-space: pre-wrap; color: #a8abb2; padding: 10px 0 2px 0;`;
export const actionStyle = `padding: 6px 0 2px 0; font-style: italic;`;
export const travelRoomStyle = `padding: 16px 0 4px 0; color: #c1a657;`;
export const summonStyle = `padding: 10px 0 2px 0; font-style: italic;`;
export const warnStyle = `white-space: pre-wrap; color: #9a593e; padding: 10px 0 2px 0;`;
export const warnFieldsetStyle = `border-color: #9a593e;`;
export const warnFieldsetLabelStyle = `color: #9a593e;`;
export const dndStyle = `white-space: pre-wrap; padding: 10px 0 2px 0;`;
