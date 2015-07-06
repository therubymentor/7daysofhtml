// remove the static text for search engines
var app;

function getParameter(theParameter) { 
  var params = window.location.search.substr(1).split('&');

  for (var i = 0; i < params.length; i++) {
    var p=params[i].split('=');
    if (p[0] == theParameter) {
      return decodeURIComponent(p[1]);
    }
  }
  return false;
}

$.fn.ready(function(){

  var $body = $("body");

  // epic browser fail
  if ((Modernizr.generatedcontent === false) || (Modernizr.localstorage === false)) {
    $("body").addClass("error").removeClass("loading").css({ width: "700px", margin: "20px auto" }).html("<h1>Dang.</h1><p>Looks like your browser didn't pass whatever random tests I decided were arbitrarily important:</p><pre>Modernizr: " + JSON.stringify(Modernizr).replace(/,/gi, ",\n    ").replace(/{/gi, "{\n    ").replace(/}/gi, "\n}") + "</pre><p>If you think this is in error or that I'm a dummy, contact me <a href=\"http://mynameistommy.com/\">here</a>. Otherwise, if you'd like to use this app, <a href='http://browsehappy.com/'>upgrade your browser</a>.</p>");
    return false;
  }

  app = {
    appname: "7 Day HTML Bootcamp from RubyMentor",
    html: "",
    css: "",
    editors: {},
    throttle: {
      render: undefined
    },
    $: {
      output: {
        body: $("#ifrOutput").contents().find("body"),
        head: $("#ifrOutput").contents().find("head")
      }
    },
    fn: {
     setHtml: function(val) {
        app.html = val || app.html;
      },
      setCss: function(val) {
        app.css = val || app.css;
      },
      // sets app props, fills editors, renders output
      renderIt: function(settings) {
        if (typeof settings !== "object") { return false; }
        if (!settings.html || !settings.css) { return false; }
        app.fn.setHtml(settings.html);
        app.fn.setCss(settings.css);
        app.editors.html.getSession().setValue(settings.html);
        app.editors.css.getSession().setValue(settings.css);
        return true;
      },
      renderOutput: function(sWhat){
        app.throttle.render = app.throttle.render || setTimeout(function(){
          sWhat = sWhat || "all";
          if ((sWhat === "html") || (sWhat === "all")) {
            app.$.output.body.html(
                app.html
                );
            var sTitle = app.$.output.body.find("h1:first").text().trim();
            document.title = app.appname;
            if (sTitle && sTitle !== app.appname) { document.title +=  " - " + sTitle; }
          }
          if ((sWhat === "css") || (sWhat === "all")) {
            app.$.output.head.html($("<style />").html(app.css));
          }
          app.throttle.render = undefined;
        }, 500);
      },
      saveToLocal: function(day){
        var obj = {
          html: app.editors.html.getSession().getValue(),
          css: app.editors.css.getSession().getValue()
        };
        localStorage.setItem(day, JSON.stringify(obj));
        return localStorage.getItem(day);
      },
      getLocal: function(day) {
        data = localStorage.getItem(day);
        if (data) {
          app.fn.renderIt($.parseJSON(data));
          return true;
        }
        return false;
      },
      getData: function(day){
        var iMilli = +new Date(), def = {};
        function load() {
          if (def.html && def.css) {
            app.fn.renderIt(def);
          }
        }
        $.get("data/"+day+".html?" + iMilli, function(resp) {
          def.html = resp;
          load();
        }, "text");
        $.get("data/"+day+".css?" + iMilli, function(resp) {
          def.css = resp;
          load();
        }, "text");
        return true;
      },
      reset: function(day){
        localStorage.removeItem(day);
        app.fn.getData(day);
      }
    } // fn
  };

  // instantiate ace editors
  var editors = [
  { name: "html", id: "preHtml", mode: require("ace/mode/html").Mode },
  { name: "css", id: "preCss", mode: require("ace/mode/css").Mode }
  ];
  var day = function() {
    var d;
    if(location.href.split("?").length>1) {
      code = getParameter("day");
      console.debug(code);
      switch(code) {
        case "kickass":
          d = 2
          break;
        case "killinit":
          d = 3
          break;
        case "getpaid":
          d = 4
          break;
        case "mascafeporfavor":
          d = 5
          break;
        case "SHARK!":
          d = 6
          break;
        case "momoney":
          d = 7
          break;
      }
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

  if (!app.fn.getLocal(day)) {
    app.fn.getData(day);
  }
  app.fn.renderOutput();

  // bind change events (not perfect: doesn't know paste, deleting)
  // could be abstracted more
  app.editors.html.getSession().on('change', function() {
    app.fn.setHtml(app.editors.html.getSession().getValue());
    app.fn.renderOutput("html");
    app.fn.saveToLocal(day);
  });
  app.editors.css.getSession().on('change', function() {
    app.fn.setCss(app.editors.css.getSession().getValue());
    app.fn.renderOutput("css");
    app.fn.saveToLocal(day);
  });

  app.$.nav = $("#nav");

  app.$.nav
  .on("click", "#aReset", function(){
    app.fn.reset(day);
    return false;
  });

  // force links in output out of iframe
  app.$.output.body.on("click", "a", function() {
    var $a = $(this);
    if ($a.attr("href") && $a.attr("href") !== "#") {
      document.location = $a.attr("href");
    }
  });

  $body.removeClass("loading");
});
