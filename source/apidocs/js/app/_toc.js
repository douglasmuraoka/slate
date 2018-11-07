//= require ../lib/_jquery
//= require ../lib/_imagesloaded.min
;(function () {
  'use strict';

  var htmlPattern = /<[^>]*>/g;
  var loaded = false;

  var debounce = function(func, waitTime) {
    var timeout = false;
    return function() {
      if (timeout === false) {
        setTimeout(function() {
          func();
          timeout = false;
        }, waitTime);
        timeout = true;
      }
    };
  };

  var closeToc = function() {
    $(".toc-wrapper").removeClass('open');
    $("#nav-button").removeClass('open');
  };

  function loadToc($toc, tocLinkSelector, tocListSelector, scrollOffset) {
    var headerHeights = {};
    var pageHeight = 0;
    var windowHeight = 0;
    var originalTitle = document.title;

    var fixCustomClassHeadings = function() {
      // Selects all headings from the document
      var headings = Array.from(document.querySelectorAll('h1[id], h2[id], h3[id]'));
      var firstClassHeading = null;
      var lastClassHeading = null;
      for (var i=0; i<headings.length; i++) {
        // Finds the index of the first custom class heading
        if (!firstClassHeading && headings[i].id === 'classname-class') {
          firstClassHeading = i;
        }
        // Finds the index of the last custom class heading
        else if (firstClassHeading && headings[i].tagName === 'H1' && headings[i].id !== 'classname-class') {
          lastClassHeading = i - 1;
          break;
        }
      }
      if (firstClassHeading && lastClassHeading) {
        // Filters all non custom class headings
        var classHeadings = headings.slice(firstClassHeading, lastClassHeading + 1);
        var customClassName = null;
        for (i=0; i<classHeadings.length; i++) {
          // If the heading is a H1, updates the ID with `${className}-custom-class`
          if (!customClassName || classHeadings[i].tagName === 'H1') {
            customClassName = classHeadings[i].innerText.split(' Class')[0];
            classHeadings[i].id = customClassName + '-custom-class';
          }
          // If the heading is from a subsection of the class, adds the prefix `${className}-` to the ID
          else {
            classHeadings[i].id = customClassName + '-' + classHeadings[i].id;
          }
        }
      }
    };

    var recacheHeights = function() {
      headerHeights = {};
      pageHeight = $(document).height();
      windowHeight = $(window).height();

      $toc.find(tocLinkSelector).each(function() {
        var targetId = $(this).attr('href');
        if (targetId[0] === "#") {
          headerHeights[targetId] = $(targetId).offset().top;
        }
      });
    };

    var refreshToc = function() {
      var currentTop = $(document).scrollTop() + scrollOffset;

      if (currentTop + windowHeight >= pageHeight) {
        // at bottom of page, so just select last header by making currentTop very large
        // this fixes the problem where the last header won't ever show as active if its content
        // is shorter than the window height
        currentTop = pageHeight + 1000;
      }

      var best = null;
      for (var name in headerHeights) {
        if ((headerHeights[name] < currentTop && headerHeights[name] > headerHeights[best]) || best === null) {
          best = name;
        }
      }

      // Catch the initial load case
      if (currentTop == scrollOffset && !loaded) {
        best = window.location.hash;
        loaded = true;
      }

      var $best = $toc.find("[href='" + best + "']").first();
      if (!$best.hasClass("active")) {
        // .active is applied to the ToC link we're currently on, and its parent <ul>s selected by tocListSelector
        // .active-expanded is applied to the ToC links that are parents of this one
        $toc.find(".active").removeClass("active");
        $toc.find(".active-parent").removeClass("active-parent");
        $best.addClass("active");
        $best.parents(tocListSelector).addClass("active").siblings(tocLinkSelector).addClass('active-parent');
        $best.siblings(tocListSelector).addClass("active");
        $toc.find(tocListSelector).filter(":not(.active)").slideUp(150);
        $toc.find(tocListSelector).filter(".active").slideDown(150);
        if (window.history.replaceState) {
          window.history.replaceState(null, "", best);
        }
        var thisTitle = $best.data("title")
        if (thisTitle !== undefined && thisTitle.length > 0) {
          document.title = thisTitle + " – " + originalTitle;
        } else {
          document.title = originalTitle;
        }
      }
    };

    var makeToc = function() {
      fixCustomClassHeadings();
      recacheHeights();
      refreshToc();

      $("#nav-button").click(function() {
        $(".toc-wrapper").toggleClass('open');
        $("#nav-button").toggleClass('open');
        return false;
      });
      $(".page-wrapper").click(closeToc);
      $(".toc-link").click(closeToc);

      // reload immediately after scrolling on toc click
      $toc.find(tocLinkSelector).click(function() {
        setTimeout(function() {
          refreshToc();
        }, 0);
      });

      $(window).scroll(debounce(refreshToc, 200));
      $(window).resize(debounce(recacheHeights, 200));
    };

    makeToc();

    window.recacheHeights = recacheHeights;
    window.refreshToc = refreshToc;
  }

  window.loadToc = loadToc;
})();
