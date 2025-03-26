import { CompositeDecorator } from 'draft-js';

// Link decorator component as a named export
export const LinkComponent = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  return (
    <a
      href={url}
      style={{ color: '#2196f3', textDecoration: 'underline' }}
      target="_blank"
      rel="noopener noreferrer"
    >
      {props.children}
    </a>
  );
};

// Existing decorator for explicit LINK entities
const linkEntityDecorator = {
  strategy: (contentBlock, callback, contentState) => {
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'LINK'
        );
      },
      callback
    );
  },
  component: LinkComponent,
};

// New decorator to detect plain text URLs using a regex
const regexUrlDecorator = {
  strategy: (contentBlock, callback) => {
    const text = contentBlock.getText();
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      callback(start, end);
    }
  },
  component: (props) => {
    const url = props.decoratedText;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#2196f3', textDecoration: 'underline' }}
      >
        {props.children}
      </a>
    );
  },
};

// Combine both decorators
export const LinkDecorator = new CompositeDecorator([
  linkEntityDecorator,
  regexUrlDecorator,
]);