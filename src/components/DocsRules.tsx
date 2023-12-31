import { useState } from 'react';
import '../styles/DocsRules.css';
import Docs from './Docs';
import Rules from './Rules';
import WithSidebar from './Sidebar';

const contents = [
  { name: 'Rules', body: Rules },
  { name: 'Docs', body: Docs },
];

function DocsRules() {
  const [content, setContent] = useState(contents[0]);

  function showContent(index: number) {
    setContent(contents[index]);
  }

  return (
    <WithSidebar
      sidebarElements={contents.map((content, index) => {
        return (
          <span key={index} className="sidebar-item interactable" onClick={() => showContent(index)}>
            {content.name}
          </span>
        );
      })}
      content={content.body}
    />
  );
}

export default DocsRules;
