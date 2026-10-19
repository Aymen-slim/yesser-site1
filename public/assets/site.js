var photoStyle = document.createElement("style");
photoStyle.textContent = [
  ".w-slider,.w-slider-mask,.w-slide,.fs-slider_slider,.fs-slider_slide,.fs-slider_mask,",
  ".collection-item,.collection-item-4,.parallax-photo-wrapper,.big-photo,.small-photo,",
  ".project-template-hero-image-wrapper,.project-image-wrapper,.project-image-wrapper-2,",
  ".portfolio-grid-photo,.image-24,.image-48,img{",
  "background-color:transparent!important}",
  "img.extra-small,img.small,img.medium,img.big,img.image-48,img.image-50,img.image-11{",
  "object-fit:contain!important;aspect-ratio:auto!important;width:auto!important;height:auto!important;max-width:100%!important}",
  "img.extra-small{max-height:26svw!important}",
  "img.small{max-height:35svw!important}",
  "img.medium{max-height:44svw!important}",
  "img.big{max-height:100vh!important}",
  "img.image-48{max-height:100svh!important}",
  "img.image-11{width:100%!important;height:auto!important;max-height:none!important}",
  "img.image-36{width:8.5rem!important;max-width:24vw!important;height:auto!important;max-height:16rem!important;object-fit:contain!important;aspect-ratio:auto!important}",
  "a.footer-link.is-copyright:hover{text-decoration:underline!important}"
].join("");
document.head.appendChild(photoStyle);

(function () {
  var hero = document.querySelector(".home-hero_slide.is-header");
  var header = document.querySelector(".home-header_content-wrapper");
  if (!hero || !header) return;
  var shown = false;
  function reveal() {
    if (shown) return;
    shown = true;
    setTimeout(function () {
      header.classList.add("is-ready");
    }, 300);
  }
  function preloaderGone() {
    var pre = document.querySelector(".preloader-container");
    if (!pre) return true;
    var style = getComputedStyle(pre);
    if (style.display === "none" || style.visibility === "hidden") return true;
    if (parseFloat(style.opacity) < 0.05) return true;
    return pre.getBoundingClientRect().height < 8;
  }
  function ready() {
    if (!(hero.complete && hero.naturalWidth)) return;
    if (preloaderGone()) reveal();
  }
  hero.addEventListener("load", ready, { once: true });
  var frames = 0;
  function watch() {
    ready();
    frames += 1;
    if (!shown && frames < 600) requestAnimationFrame(watch);
  }
  requestAnimationFrame(watch);
  setTimeout(reveal, 4500);
})();

function clearPlaceholderBackgrounds() {
  document.querySelectorAll(".project-template-hero-image-wrapper,.project-image-wrapper,.project-image-wrapper-2,.collection-item-4,.parallax-photo-wrapper,.big-photo,.small-photo,.w-slide,.fs-slider_slide").forEach(function (el) {
    var image = getComputedStyle(el).backgroundImage;
    if (image && image.indexOf("background-image.svg") !== -1) {
      el.style.backgroundImage = "none";
    }
  });
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", clearPlaceholderBackgrounds);
} else {
  clearPlaceholderBackgrounds();
}

document.addEventListener(
  "click",
  function (event) {
    var consent = event.target.closest && event.target.closest(".consent-button");
    if (consent) {
      event.preventDefault();
      try {
        localStorage.setItem("yb-consent", consent.textContent.trim().toLowerCase() === "reject" ? "rejected" : "accepted");
      } catch (e) {}
      document.documentElement.classList.add("yb-consent-set");
      var banner = document.querySelector(".cookie-banner");
      if (banner) banner.style.display = "none";
      return;
    }

    var send = event.target.closest && event.target.closest("form.form a.cta");
    if (!send) return;
    event.preventDefault();
    var form = send.closest("form");
    if (form && typeof form.requestSubmit === "function") form.requestSubmit();
  },
  true
);

function inquiryContactOk(value) {
  var text = String(value || "").trim();
  if (!text || text.length > 200) return false;
  if (text.indexOf("@") !== -1) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
  var number = text.replace(/[\s().-]/g, "");
  if (number.indexOf("00") === 0) number = "+" + number.slice(2);
  if (/^[2-9]\d{7}$/.test(number) || /^216[2-9]\d{7}$/.test(number)) return true;
  if (number.indexOf("+216") === 0) return /^\+216[2-9]\d{7}$/.test(number);
  return /^\+[1-9]\d{6,14}$/.test(number);
}

function inquiryField(form, name) {
  var input = form.elements[name];
  return input && "value" in input ? String(input.value) : "";
}

document.addEventListener(
  "input",
  function (event) {
    var input = event.target;
    if (input && input.id === "Client-E-Mail") input.setCustomValidity("");
  },
  true
);

document.addEventListener(
  "submit",
  function (event) {
    var form = event.target;
    if (!form || !form.classList || !form.classList.contains("form")) return;
    var contact = form.querySelector("#Client-E-Mail");
    if (contact) {
      contact.setCustomValidity(inquiryContactOk(contact.value) ? "" : "Enter an email or a phone number.");
    }
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof form.reportValidity === "function") form.reportValidity();
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    var block = form.closest(".w-form");
    if (!block) return;
    var done = block.querySelector(".w-form-done");
    var fail = block.querySelector(".w-form-fail");
    var button = form.querySelector(".submit-button");
    var previous = button ? button.value : "";
    if (button) {
      button.disabled = true;
      button.value = button.getAttribute("data-wait") || "Please wait...";
    }
    if (fail) fail.style.display = "none";

    fetch(form.getAttribute("data-crm") || "https://yesser-crm.vercel.app/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: inquiryField(form, "Client-Name"),
        instagram: inquiryField(form, "Client-Instagram"),
        wedding_date: inquiryField(form, "Wedding-Date"),
        venue: inquiryField(form, "Wedding-Venue"),
        guests: inquiryField(form, "Guest-Number"),
        planner: inquiryField(form, "Wedding-Planner-Name"),
        found_on: inquiryField(form, "Where-They-Found-Us"),
        contact: contact ? contact.value : "",
        fax: inquiryField(form, "fax"),
      }),
    })
      .then(function (response) {
        if (!response.ok) throw new Error("inquiry");
        form.style.display = "none";
        if (done) done.style.display = "block";
      })
      .catch(function () {
        if (button) {
          button.disabled = false;
          button.value = previous;
        }
        if (fail) fail.style.display = "block";
      });
  },
  true
);

(function () {
  var hero = document.querySelector(".home-hero");
  var wrap = document.querySelector(".home-header_content-wrapper");
  if (!hero || !wrap) return;
  var slides = Array.prototype.slice.call(hero.querySelectorAll(".home-hero_slide"));
  var meters = Array.prototype.slice.call(hero.querySelectorAll(".home-hero_meter span"));
  if (slides.length < 2) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var index = 0;
  var timer = null;
  var delay = 3000;
  var started = false;
  var origin = null;
  var swiped = false;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    meters.forEach(function (meter, i) {
      meter.classList.toggle("is-done", i < index);
      meter.classList.remove("is-active");
    });
    var current = meters[index];
    if (current && !reduce) {
      void current.offsetWidth;
      current.classList.add("is-active");
    }
  }

  function arm() {
    if (timer) clearTimeout(timer);
    timer = null;
    if (reduce || document.hidden || !started) return;
    timer = setTimeout(function () {
      show(index + 1);
      arm();
    }, delay);
  }

  function step(direction) {
    show(index + direction);
    arm();
  }

  wrap.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    origin = { x: event.clientX, y: event.clientY, id: event.pointerId };
    swiped = false;
  });

  function finishSwipe(event) {
    if (!origin || origin.id !== event.pointerId) return;
    var dx = event.clientX - origin.x;
    var dy = event.clientY - origin.y;
    origin = null;
    if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy) * 1.15) return;
    swiped = true;
    step(dx < 0 ? 1 : -1);
  }

  wrap.addEventListener("pointerup", finishSwipe);
  wrap.addEventListener("pointercancel", function () {
    origin = null;
  });
  wrap.addEventListener(
    "click",
    function (event) {
      if (!swiped) return;
      swiped = false;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  document.addEventListener("visibilitychange", function () {
    if (!started) return;
    if (document.hidden) {
      if (timer) clearTimeout(timer);
      timer = null;
    } else {
      arm();
    }
  });

  var waits = 0;
  function boot() {
    var pre = document.querySelector(".preloader-container");
    var gone = !pre;
    if (pre) {
      var style = getComputedStyle(pre);
      var box = pre.getBoundingClientRect();
      gone = style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) < 0.05 || box.height < 2 || box.bottom < 0;
    }
    if (gone || waits > 24) {
      started = true;
      show(0);
      arm();
    } else {
      waits += 1;
      setTimeout(boot, 250);
    }
  }

  boot();
})();

(function () {
  var videos = Array.prototype.slice.call(document.querySelectorAll("video"));
  if (!videos.length) return;

  var mobileCut = window.matchMedia("(max-width: 479px)");

  function rememberedUrl(video) {
    var saved = video.getAttribute("data-src");
    if (saved) return saved;
    var source = video.querySelector("source[src]");
    if (source && source.getAttribute("src")) return source.getAttribute("src");
    if (video.getAttribute("src")) return video.getAttribute("src");
    var parent = video.closest("[data-video-urls]");
    if (!parent) return "";
    var urls = parent.getAttribute("data-video-urls").split(",");
    for (var i = 0; i < urls.length; i++) {
      var url = urls[i].trim();
      if (url) return url;
    }
    return "";
  }

  videos.forEach(function (video) {
    var url = rememberedUrl(video);
    if (url) video.setAttribute("data-src", url);
    var sources = video.querySelectorAll("source");
    for (var i = 1; i < sources.length; i++) sources[i].parentNode.removeChild(sources[i]);
    if (!video.style.backgroundImage) {
      var posterHost = video.closest("[data-poster-url]");
      var poster = posterHost && posterHost.getAttribute("data-poster-url");
      if (poster) {
        video.style.backgroundImage = 'url("' + poster + '")';
        video.style.backgroundSize = "cover";
        video.style.backgroundPosition = "center";
      }
    }
  });

  function frameOf(video) {
    return video.closest(".videozoom") || video.closest(".w-background-video") || video;
  }

  function hiddenDuplicate(video) {
    var zoom = video.closest(".videozoom");
    if (!zoom) return false;
    var mobile = zoom.classList.contains("is-mobile");
    return mobileCut.matches ? !mobile : mobile;
  }

  function box(video) {
    var rect = frameOf(video).getBoundingClientRect();
    var height = window.innerHeight || document.documentElement.clientHeight;
    return { rect: rect, height: height };
  }

  function onScreen(video) {
    if (hiddenDuplicate(video)) return false;
    var view = box(video);
    if (view.rect.width < 2 || view.rect.height < 2) return false;
    return view.rect.bottom > 0 && view.rect.top < view.height;
  }

  function comingUp(video) {
    if (hiddenDuplicate(video)) return false;
    var view = box(video);
    if (view.rect.width < 2 || view.rect.height < 2) return false;
    return view.rect.bottom > -360 && view.rect.top < view.height + 360;
  }

  function stillBuffering() {
    return videos.some(function (video) {
      return video.getAttribute("data-loaded") && !video.getAttribute("data-failed") && onScreen(video) && video.readyState < 3;
    });
  }

  function play(video) {
    var pending = video.play();
    if (pending && typeof pending.catch === "function") pending.catch(function () {});
  }

  function release(video) {
    if (video.getAttribute("data-releasing")) return;
    if (!video.getAttribute("data-loaded") && !video.getAttribute("src") && !video.querySelector("source[src]")) return;
    video.setAttribute("data-releasing", "1");
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach(function (source) {
      source.removeAttribute("src");
    });
    video.removeAttribute("data-loaded");
    video.removeAttribute("data-failed");
    video.preload = "none";
    video.load();
  }

  function start(video) {
    var url = video.getAttribute("data-src");
    if (!url) return;
    if (video.getAttribute("data-loaded") === url) {
      if (onScreen(video) && video.paused && !video.getAttribute("data-failed")) play(video);
      return;
    }

    var source = video.querySelector("source[src]");
    var existing = (source && source.getAttribute("src")) || video.getAttribute("src") || "";
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.loop = true;
    video.autoplay = true;

    if (existing && existing.split("#")[0] === url.split("#")[0]) {
      video.setAttribute("data-loaded", url);
      if (onScreen(video)) play(video);
      return;
    }

    video.querySelectorAll("source").forEach(function (node) {
      node.parentNode.removeChild(node);
    });
    video.preload = "auto";
    if (!document.querySelector("video[fetchpriority='high']")) video.setAttribute("fetchpriority", "high");
    video.setAttribute("data-loaded", url);
    if (!video.getAttribute("data-armed")) {
      video.setAttribute("data-armed", "1");
      video.addEventListener("canplay", sync);
      video.addEventListener("error", function () {
        if (video.getAttribute("data-releasing")) return;
        if (!video.getAttribute("src") && !video.currentSrc) return;
        if (video.error && video.error.code === 1) return;
        video.setAttribute("data-failed", "1");
        sync();
      });
    }
    video.removeAttribute("data-releasing");
    video.removeAttribute("data-failed");
    video.src = url;
    if (onScreen(video)) play(video);
  }

  function sync() {
    videos.forEach(function (video) {
      if (hiddenDuplicate(video)) release(video);
    });

    var waiting = videos.filter(function (video) {
      return video.getAttribute("data-src") && !hiddenDuplicate(video) && !video.getAttribute("data-loaded") && (onScreen(video) || comingUp(video));
    });
    waiting.sort(function (a, b) {
      return (onScreen(b) ? 1 : 0) - (onScreen(a) ? 1 : 0);
    });
    var busy = stillBuffering();
    waiting.forEach(function (video) {
      if (busy) return;
      start(video);
      if (video.readyState < 3 && !video.getAttribute("data-failed")) busy = true;
    });

    videos.forEach(function (video) {
      if (!video.getAttribute("data-loaded") || hiddenDuplicate(video)) return;
      if (onScreen(video)) {
        if (video.paused && !video.getAttribute("data-failed")) play(video);
      } else if (!comingUp(video) && !video.paused) {
        video.pause();
      }
    });
  }

  if ("IntersectionObserver" in window) {
    var watch = new IntersectionObserver(function () { sync(); }, { rootMargin: "360px 0px", threshold: 0.01 });
    videos.forEach(function (video) { watch.observe(frameOf(video)); });
  } else {
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
  }

  if (typeof mobileCut.addEventListener === "function") mobileCut.addEventListener("change", sync);
  else if (typeof mobileCut.addListener === "function") mobileCut.addListener(sync);

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) sync();
  });
  window.addEventListener("load", sync);

  sync();
  requestAnimationFrame(sync);
})();
