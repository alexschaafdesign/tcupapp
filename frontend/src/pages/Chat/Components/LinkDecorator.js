import React from 'react';
import { CompositeDecorator } from 'draft-js';

// Only focus on explicit links and URLs with http/https
// This prevents over-detection that can cause loops
const linkStrategy = (contentBlock, callback, contentState) => {
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
};

const LinkComponent = (props) => {
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

// Create a single instance of the decorator
export const LinkDecorator = new CompositeDecorator([
  {
    strategy: linkStrategy,
    component: LinkComponent
  }
]);