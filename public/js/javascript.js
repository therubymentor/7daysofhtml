// remove the static text for search engines
document.getElementById("static").style.display = "none";

var sevenDayBootcamp;		// kept outside for console inspection

$.fn.ready(function(){

  var $body = $("body");

  // browser fail
  if ((Modernizr.generatedcontent === false) || (Modernizr.localstorage === false)) {
    $("body").addClass("error").removeClass("loading").css({ width: "700px", margin: "20px auto" }).html("<h1>Dang.</h1><p>Looks like your browser didn't pass whatever random tests I decided were arbitrarily important:</p><pre>Modernizr: " + JSON.stringify(Modernizr).replace(/,/gi, ",\n    ").replace(/{/gi, "{\n    ").replace(/}/gi, "\n}") + "</pre><p>If you think this is in error or that I'm a dummy, contact me <a href=\"http://mynameistommy.com/\">here</a>. Otherwise, if you'd like to use this app, <a href='http://browsehappy.com/'>upgrade your browser</a>.</p>");
    return false;
  }

  sevenDayBootcamp = {
    appname: "Seven Day HTML/CSS Bootcamp",
    structure: "",
    style: "",
    editors: {},
    throttle: {
      // in case I add other throttlers later...
      render: undefined
    },
      $: {
        output: {
          body: $("#ifrOutput").contents().find("body"),
          head: $("#ifrOutput").contents().find("head")
        }
      },
    fn: {
     setStructure: function(_structure) {
        sevenDayBootcamp.structure = _structure || sevenDayBootcamp.structure;
      },
      setStyle: function(_style) {
        sevenDayBootcamp.style = _style || sevenDayBootcamp.style;
      },
        // sets sevenDayBootcamp props, fills editors, renders output
      useStructureStyle: function(settings) {
        if (typeof settings !== "object") { return false; }
        if (!settings.structure || !settings.style) { return false; }
        sevenDayBootcamp.fn.setStructure(settings.structure);
        sevenDayBootcamp.fn.setStyle(settings.style);
        sevenDayBootcamp.editors.structure.getSession().setValue(settings.structure);
        sevenDayBootcamp.editors.style.getSession().setValue(settings.style);
        return true;
      },
      renderOutput: function(sWhat){
        sevenDayBootcamp.throttle.render = sevenDayBootcamp.throttle.render || setTimeout(function(){
          sWhat = sWhat || "all";
          if ((sWhat === "html") || (sWhat === "all")) {
            sevenDayBootcamp.$.output.body.html(
                sevenDayBootcamp.structure
                );
            var sTitle = sevenDayBootcamp.$.output.body.find("h1:first").text().trim();
            document.title = sevenDayBootcamp.appname;
            if (sTitle && sTitle !== sevenDayBootcamp.appname) { document.title +=  " - " + sTitle; }
          }
          if ((sWhat === "style") || (sWhat === "all")) {
            sevenDayBootcamp.$.output.head.html(
                $("<style />").html(sevenDayBootcamp.style)
                );
          }
          sevenDayBootcamp.throttle.render = undefined;
        }, 500);
      },
      saveToLocal: function(){
        var obj = {
          structure: sevenDayBootcamp.editors.structure.getSession().getValue(),
          style: sevenDayBootcamp.editors.style.getSession().getValue()
        };
        localStorage.sevenDayBootcamp = JSON.stringify(obj);
        return localStorage.sevenDayBootcamp;
      },
      getLocal: function() {
        if (localStorage.sevenDayBootcamp) {
          sevenDayBootcamp.fn.useStructureStyle($.parseJSON(localStorage.sevenDayBootcamp));
          return true;
        }
        return false;
      },
      getDefaults: function(){
        // probably not the cleanest way to do this...
        var iMilli = +new Date(), def = {};
        function areWeThereYet() {
          if (def.structure && def.style) {
            sevenDayBootcamp.fn.useStructureStyle(def);
          }
        }
        $.get("defaults/structure.html?" + iMilli, function(resp) {
          def.structure = resp;
          areWeThereYet();
        }, "text");
        $.get("defaults/style.css?" + iMilli, function(resp) {
          def.style = resp;
          areWeThereYet();
        }, "text");
        return true;
      },
      reset: function(){
        delete localStorage.sevenDayBootcamp;
        sevenDayBootcamp.fn.getDefaults();
      },
      exportUri: function(){
        // will open a data URI in a new window, some browsers may cut it off...
        var sTitle = sevenDayBootcamp.$.output.body.find("h1:first").text().trim();
        var sUrl = "data:text/html," +
          encodeURIComponent(
              (sTitle ? "<title>" + sTitle + "</title> " : "") +
              "<body>" + sevenDayBootcamp.structure + "</body> " +
              "<style>" + sevenDayBootcamp.style + "</style> " +
              "<form action='" + document.location.protocol + "//" + document.location.host + document.location.pathname + "' method='get' style='display:none'>" + 
              "<textarea name='structure'>" + sevenDayBootcamp.editors.structure.getSession().getValue() + "</textarea> " +
              "<textarea name='style'>" + sevenDayBootcamp.editors.style.getSession().getValue() + "</textarea> " +
              "</form> " +
              "<script src='" + document.location.protocol + "//" + document.location.host + document.location.pathname + "js/external.js'></script>"
              );
        window.open(sUrl);
      },
      getFromUrl: function(){
        // http://stackoverflow.com/questions/439463/how-to-get-get-and-post-variables-with-jquery
        var params = (function(){
          var qs = document.location.search.split("+").join(" ");
          var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g;
          while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
          }
          return params;
        }());
        if (!params.structure || !params.style) { return false; }
        sevenDayBootcamp.fn.useStructureStyle(params);
        // clean up URL
        if (Modernizr.history) {
          history.replaceState(null, null, document.location.pathname);
        }
        return true;
      },
      fileDragOver: function (evt) {
        evt.stopPropagation();
          evt.preventDefault();
          $body.addClass("dropit");
      },
      fileDrop: function (evt) {
        evt.stopPropagation();
          evt.preventDefault();
          var files = evt.dataTransfer.files;
          for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
              reader.onload = (function (theFile) {
                return function (e) {
                  // clean this up!
                  if (theFile.name.indexOf(".html") > -1) {
                    sevenDayBootcamp.editors.structure.getSession().setValue(e.target.result);
                    sevenDayBootcamp.fn.setStructure(e.target.result);
                  } else if (theFile.name.indexOf(".css") > -1) {
                    sevenDayBootcamp.editors.style.getSession().setValue(e.target.result);
                    sevenDayBootcamp.fn.setStyle(e.target.result);
                  }
                };
              })(f);
            reader.readAsText(f);
          }
        sevenDayBootcamp.fn.renderOutput();
        sevenDayBootcamp.fn.saveToLocal();
        $body.removeClass("dropit");
      }
    } // fn
  };

  // instantiate ace editors
  var editors = [
  { name: "structure", id: "preStructure", mode: require("ace/mode/html").Mode },
  { name: "style", id: "preStyle", mode: require("ace/mode/css").Mode }
  ];
  $.each(editors, function (iEditor, editor) {
    var $editor = sevenDayBootcamp.$[editor.name] = $("#" + editor.id);
    var oEditor = ace.edit(editor.id);
    oEditor.setTheme("ace/theme/twilight");
    oEditor.getSession().setMode(new editor.mode);
    oEditor.renderer.setShowGutter(false);
    oEditor.renderer.setShowPrintMargin(false);
    oEditor.getSession().setUseSoftTabs(true);
    sevenDayBootcamp.editors[editor.name] = oEditor;
    oEditor.on("focus", function(){ $editor.addClass("focus"); });
    oEditor.on("blur", function(){ $editor.removeClass("focus"); });
  });

  // attempt: fill from URL, get localStorage, or load defaults; then render
  if (!sevenDayBootcamp.fn.getFromUrl()) {
    if (!sevenDayBootcamp.fn.getLocal()) {
      sevenDayBootcamp.fn.getDefaults();
    }
  }
  sevenDayBootcamp.fn.renderOutput();

  // bind change events (not perfect: doesn't know paste, deleting)
  // could be abstracted more
  sevenDayBootcamp.editors.structure.getSession().on('change', function() {
    sevenDayBootcamp.fn.setStructure(sevenDayBootcamp.editors.structure.getSession().getValue());
    sevenDayBootcamp.fn.renderOutput("html");
    sevenDayBootcamp.fn.saveToLocal();
  });
  sevenDayBootcamp.editors.style.getSession().on('change', function() {
    sevenDayBootcamp.fn.setStyle(sevenDayBootcamp.editors.style.getSession().getValue());
    sevenDayBootcamp.fn.renderOutput("style");
    sevenDayBootcamp.fn.saveToLocal();
  });

  sevenDayBootcamp.$.nav = $("#nav");

  // view switcher and nav links
  sevenDayBootcamp.$.nav
    .on("click", ".inpView", function(){
      var $checked = sevenDayBootcamp.$.nav.find("input:checked"), sVal = $checked.val();
      $body.attr("role", sVal);
      localStorage.view = sVal;
      $.each(sevenDayBootcamp.editors, function(i, editor) {
        editor.resize();
      });
    })
  .on("click", "#aReset", function(){
    sevenDayBootcamp.fn.reset();
    return false;
  })
  .on("click", "#aExport", function(){
    sevenDayBootcamp.fn.exportUri();
    return false;
  });

  // view in localStorage?
  if (localStorage.view) { $(".inpView[value='" + localStorage.view + "']").click(); }

  // handle files getting dragged into document
  if (Modernizr.file) {
    $body[0].addEventListener('dragover', sevenDayBootcamp.fn.fileDragOver, false);
      $body[0].addEventListener('drop', sevenDayBootcamp.fn.fileDrop, false);
    sevenDayBootcamp.$.output.body[0].addEventListener('dragover', sevenDayBootcamp.fn.fileDragOver, false);
      sevenDayBootcamp.$.output.body[0].addEventListener('drop', sevenDayBootcamp.fn.fileDrop, false);
  }

  // force links in output out of iframe
  sevenDayBootcamp.$.output.body.on("click", "a", function() {
    var $a = $(this);
    if ($a.attr("href") && $a.attr("href") !== "#") {
      document.location = $a.attr("href");
    }
  });

  $body.removeClass("loading");

});
