import React from 'react';
interface Subtopic { heading: string; content: string; children?: Subtopic[]; }
function renderSubtopic(node: Subtopic, level: number = 2) {
  const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
  return (
    <div key={node.heading} className="mt-6">
      <HeadingTag className="font-bold text-gray-800 mb-2">{node.heading}</HeadingTag>
      <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: node.content }} />
      {(node.children?.length ?? 0) > 0 && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4 mt-4 space-y-6">
          {node.children!.map(child => renderSubtopic(child, level + 1))}
        </div>
      )}
    </div>
  );
}
export default function KeywordContent({ subtopics }: { subtopics: Subtopic[] }) {
  return <>{subtopics.map(node => renderSubtopic(node))}</>;
}
