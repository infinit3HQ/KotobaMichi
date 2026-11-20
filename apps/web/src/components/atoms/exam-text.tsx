import { type ReactNode } from "react";

const TOKEN =
  /<ruby>([\s\S]*?)<rt>([\s\S]*?)<\/rt><\/ruby>|<u>([\s\S]*?)<\/u>|<blank\/>|<slot\/>|<star\/>|（[\s\u3000]*）/g;

function FillBlank() {
  return (
    <span
      className="mx-0.5 inline-block w-[4.5rem] translate-y-[-0.08em] border-b border-current"
      aria-label="blank"
    />
  );
}

function OrderSlot({ star }: { star?: boolean }) {
  return (
    <span className="mx-1 inline-flex w-10 items-end justify-center border-b border-current align-baseline">
      <span className="leading-none">{star ? "★" : "\u00a0"}</span>
    </span>
  );
}

function nodes(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(TOKEN)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}-${index}`;
    index += 1;
    if (match[1] !== undefined) {
      out.push(
        <ruby key={key}>
          {match[1]}
          <rt className="text-[0.55em] font-normal tracking-normal">{match[2]}</rt>
        </ruby>,
      );
    } else if (match[3] !== undefined) {
      out.push(
        <u key={key} className="underline decoration-1 underline-offset-[0.2em]">
          {nodes(match[3], key)}
        </u>,
      );
    } else if (match[0] === "<blank/>") {
      out.push(<FillBlank key={key} />);
    } else if (match[0] === "<slot/>") {
      out.push(<OrderSlot key={key} />);
    } else if (match[0] === "<star/>") {
      out.push(<OrderSlot key={key} star />);
    } else {
      out.push(
        <span key={key}>
          （
          <FillBlank />）
        </span>,
      );
    }
    last = start + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function ExamText({ text }: { text: string }) {
  return <>{nodes(text, "exam")}</>;
}
