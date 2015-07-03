$(document).ready(function(){
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

  var machine4 = $("#machine4").slotMachine({
    active        : 0,
    delay : 500,
    randomize: function(activeElementIndex){
      return getRandomArbitrary(1, 10);
    }
  });

  var machine5 = $("#machine5").slotMachine({
    active        : 1,
    delay : 500
  });

  var machine6 = $("#machine6").slotMachine({
    active        : 2,
    delay : 500
  });

  var started = 0;

  $("#slotMachineButtonShuffle").click(function(){
    started = 3;
    machine4.shuffle();
    machine5.shuffle();
    machine6.shuffle();
  });

  $("#slotMachineButtonStop").click(function(){
    switch(started){
      case 3:
        machine4.stop();
        break;
      case 2:
        machine5.stop();
        break;
      case 1:
        machine6.stop();
        break;
    }
    started--;
  });
});
