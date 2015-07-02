// remove the static text for search engines
document.getElementById("static").style.display = "none";

var app;

$.fn.ready(function(){

  var $body = $("body");

  // browser fail
  if ((Modernizr.generatedcontent === false) || (Modernizr.localstorage === false)) {
    $("body").addClass("error").removeClass("loading").css({ width: "700px", margin: "20px auto" }).html("<h1>Dang.</h1><p>Looks like your browser didn't pass whatever random tests I decided were arbitrarily important:</p><pre>Modernizr: " + JSON.stringify(Modernizr).replace(/,/gi, ",\n    ").replace(/{/gi, "{\n    ").replace(/}/gi, "\n}") + "</pre><p>If you think this is in error or that I'm a dummy, contact me <a href=\"http://mynameistommy.com/\">here</a>. Otherwise, if you'd like to use this app, <a href='http://browsehappy.com/'>upgrade your browser</a>.</p>");
    return false;
  }

  app = {
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
        app.structure = _structure || app.structure;
      },
      setStyle: function(_style) {
        app.style = _style || app.style;
      },
        // sets app props, fills editors, renders output
      useStructureStyle: function(settings) {
        if (typeof settings !== "object") { return false; }
        if (!settings.structure || !settings.style) { return false; }
        app.fn.setStructure(settings.structure);
        app.fn.setStyle(settings.style);
        app.editors.structure.getSession().setValue(settings.structure);
        app.editors.style.getSession().setValue(settings.style);
        return true;
      },
      renderOutput: function(sWhat){
        app.throttle.render = app.throttle.render || setTimeout(function(){
          sWhat = sWhat || "all";
          if ((sWhat === "html") || (sWhat === "all")) {
            app.$.output.body.html(
                app.structure
                );
            var sTitle = app.$.output.body.find("h1:first").text().trim();
            document.title = app.appname;
            if (sTitle && sTitle !== app.appname) { document.title +=  " - " + sTitle; }
          }
          if ((sWhat === "style") || (sWhat === "all")) {
            app.$.output.head.html(
                $("<style />").html(app.style)
                );
          }
          app.throttle.render = undefined;
        }, 500);
      },
      saveToLocal: function(day){
        var obj = {
          structure: app.editors.structure.getSession().getValue(),
          style: app.editors.style.getSession().getValue()
        };
        localStorage.setItem(day, JSON.stringify(obj));
        return localStorage.getItem(day);
      },
      getLocal: function(day) {
        data = localStorage.getItem(day);
        if (data) {
          app.fn.useStructureStyle($.parseJSON(data));
          return true;
        }
        return false;
      },
      getData: function(day){
        var iMilli = +new Date(), def = {};
        function load() {
          if (def.structure && def.style) {
            app.fn.useStructureStyle(def);
          }
        }
        $.get("/data/"+day+".html?" + iMilli, function(resp) {
          def.structure = resp;
          load();
        }, "text");
        $.get("/data/"+day+".css?" + iMilli, function(resp) {
          def.style = resp;
          load();
        }, "text");
        return true;
      },
      reset: function(day){
        delete localStorage.getItem(day);
        app.fn.getData(day);
      },
      exportUri: function(){
        // will open a data URI in a new window, some browsers may cut it off...
        var sTitle = app.$.output.body.find("h1:first").text().trim();
        var sUrl = "data:text/html," +
          encodeURIComponent(
              (sTitle ? "<title>" + sTitle + "</title> " : "") +
              "<body>" + app.structure + "</body> " +
              "<style>" + app.style + "</style> " +
              "<form action='" + document.location.protocol + "//" + document.location.host + document.location.pathname + "' method='get' style='display:none'>" + 
              "<textarea name='structure'>" + app.editors.structure.getSession().getValue() + "</textarea> " +
              "<textarea name='style'>" + app.editors.style.getSession().getValue() + "</textarea> " +
              "</form> " +
              "<script src='" + document.location.protocol + "//" + document.location.host + document.location.pathname + "js/external.js'></script>"
              );
        window.open(sUrl);
      }
    } // fn
  };

  // instantiate ace editors
  var editors = [
  { name: "structure", id: "preStructure", mode: require("ace/mode/html").Mode },
  { name: "style", id: "preStyle", mode: require("ace/mode/css").Mode }
  ];
  var day = function() {
    var d;
    if(location.href.split("?").length>1) {
      d = location.href.split("?")[1].split("=")[1];
    }
    return d || 1
  }()

  $.each(editors, function (iEditor, editor) {
    var $editor = app.$[editor.name] = $("#" + editor.id);
    var oEditor = ace.edit(editor.id);
    oEditor.setTheme("ace/theme/twilight");
    oEditor.getSession().setMode(new editor.mode);
    oEditor.renderer.setShowGutter(false);
    oEditor.renderer.setShowPrintMargin(false);
    oEditor.getSession().setUseSoftTabs(true);
    app.editors[editor.name] = oEditor;
    oEditor.on("focus", function(){ $editor.addClass("focus"); });
    oEditor.on("blur", function(){ $editor.removeClass("focus"); });
  });

  // attempt: fill from localStorage, or load data; then render
  if (!app.fn.getLocal(day)) {
    app.fn.getData(day);
  }
  app.fn.renderOutput();

  // bind change events (not perfect: doesn't know paste, deleting)
  // could be abstracted more
  app.editors.structure.getSession().on('change', function() {
    app.fn.setStructure(app.editors.structure.getSession().getValue());
    app.fn.renderOutput("html");
    app.fn.saveToLocal(day);
  });
  app.editors.style.getSession().on('change', function() {
    app.fn.setStyle(app.editors.style.getSession().getValue());
    app.fn.renderOutput("style");
    app.fn.saveToLocal(day);
  });

  app.$.nav = $("#nav");

  // view switcher and nav links
  app.$.nav
    .on("click", ".inpView", function(){
      var $checked = app.$.nav.find("input:checked"), sVal = $checked.val();
      $body.attr("role", sVal);
      localStorage.view = sVal;
      $.each(app.editors, function(i, editor) {
        editor.resize();
      });
    })
  .on("click", "#aReset", function(){
    app.fn.reset(day);
    return false;
  })
  .on("click", "#aExport", function(){
    app.fn.exportUri();
    return false;
  });

  // view in localStorage?
  if (localStorage.view) { $(".inpView[value='" + localStorage.view + "']").click(); }

  // force links in output out of iframe
  app.$.output.body.on("click", "a", function() {
    var $a = $(this);
    if ($a.attr("href") && $a.attr("href") !== "#") {
      document.location = $a.attr("href");
    }
  });

  $body.removeClass("loading");

});
