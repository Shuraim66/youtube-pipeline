export type CaptionWord={word:string;startFrame:number;endFrame:number;emphasis?:boolean;prominence?:number};
export type CaptionPhrase={words:CaptionWord[];start:number;end:number};

// Fixed phrase windows keep words still while the speaking highlight advances.
// Respect scene boundaries, punctuation, audible pauses and phone-width limits.
export function captionPhrases(words:CaptionWord[], beats:{startFrame:number;endFrame:number}[]):CaptionPhrase[] {
  const result:CaptionPhrase[]=[];
  for (const beat of beats) {
    let group:CaptionWord[]=[];
    const flush=()=>{
      if(group.length) result.push({words:group,start:group[0].startFrame,end:Math.min(beat.endFrame,group[group.length-1].endFrame+6)});
      group=[];
    };
    for(const word of words.filter(w=>w.startFrame>=beat.startFrame && w.startFrame<beat.endFrame)) {
      const previous=group[group.length-1];
      if(previous && (group.length>=4 || group.map(w=>w.word).join(' ').length+word.word.length+1>30 || word.startFrame-previous.endFrame>9)) flush();
      group.push(word);
      if(/[.,:;!?]$/.test(word.word)) flush();
    }
    flush();
  }
  for(let i=0;i<result.length-1;i++) result[i].end=Math.min(result[i].end,result[i+1].start);
  return result;
}
