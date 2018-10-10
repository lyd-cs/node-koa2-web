// heartbeat

let timer;
// 19 minutes
let interval =  19 * 60 * 1000;
// beat
function beat(){
  $.get('/api/heartbeat', {time: (new Date()).getTime()});
}
// export
export default function(){
  if( timer ){
    clearTimeout(timer);
  }
  timer = setInterval(beat, interval);
};
