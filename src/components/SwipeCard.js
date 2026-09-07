import React from 'react';
import CardEdge from './CardEdge';
import CardContent from './CardContent';
import { getCardPersonaState } from './PersonaCardBadge';

export default function SwipeCard({ 
  item, 
  onSwipeLeft, 
  onSwipeRight, 
  errorCount = 0, 
  isNext = false, 
  disableSwipe = false,
  isEvaluated = false,
  isCorrect = true,

}) {
  const personaState = getCardPersonaState(errorCount);
  const currentContent = item.variants[personaState] || item.variants.default;

  return (
    <CardEdge 
      onSwipeLeft={onSwipeLeft} 
      onSwipeRight={onSwipeRight} 
      isNext={isNext} 
      disableSwipe={disableSwipe}
      isEvaluated={isEvaluated}
      isCorrect={isCorrect}
      personaState={personaState}
    >
      <CardContent 
        item={item} 
        personaState={personaState} 
        currentContent={currentContent} 
      />
    </CardEdge>
  );
}