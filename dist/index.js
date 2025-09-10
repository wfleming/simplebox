// assets/close.svg
var close_default = 'data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg">%0A  <path d="M 24,2.4171429 21.582857,0 12,9.5828571 2.4171429,0 0,2.4171429 9.5828571,12 0,21.582857 2.4171429,24 12,14.417143 21.582857,24 24,21.582857 14.417143,12 Z" fill="currentColor" style="stroke-width:1.5" />%0A</svg>%0A';

// assets/next.svg
var next_default = 'data:image/svg+xml,<svg width="14.82" height="24" viewBox="0 0 14.82 24" fill="none" version="1.1" xmlns="http://www.w3.org/2000/svg">%0A  <path d="M 2.8199999,0 -5.8069884e-8,2.82 9.1599999,12 -5.8069884e-8,21.18 2.8199999,24 14.82,12 Z" fill="currentColor" style="stroke-width:1.5" />%0A</svg>%0A';

// assets/file.svg
var file_default = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16">%0A  <path fill="currentColor" d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>%0A</svg>%0A%0A';

// lib/index.mjs
function extractSvg(dataurl) {
  return decodeURIComponent(dataurl.replace("data:image/svg+xml,", ""));
}
function extractYoutubeVideoId(url) {
  const uri = new URL(url);
  if (url.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/)) {
    return uri.searchParams.get("v");
  } else if (url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/)) {
    return uri.pathname;
  } else if (url.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/)) {
    return uri.pathname.split("/")[2];
  } else if (url.match(/(youtube\.com|youtube-nocookie\.com)\/shorts\/([a-zA-Z0-9\-_]+)/)) {
    return uri.pathname.split("/")[2];
  } else {
    throw new Error("SimpleBox bug: url was detected as a youtube url, but failed to find a video id");
  }
}
function hrefMediaType(url) {
  if (url.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/) || url.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/) || url.match(/(youtube\.com|youtube-nocookie\.com)\/shorts\/([a-zA-Z0-9\-_]+)/)) {
    return "youtube";
  } else if (url.match(/vimeo\.com\/([0-9]*)/)) {
    return "vimeo";
  } else if (url.match(/\.(jpg|jpeg|gif|png|svg|webm)$/)) {
    return "image";
  } else if (url.match(/\.(mp4|ogv)$/)) {
    return "video";
  } else {
    return "file";
  }
}
function buildIframe(src) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("allowfullscreen", "");
  iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
  iframe.setAttribute("src", src);
  return iframe;
}
var DEFAULT_CONFIG = {
  selector: "[data-simplebox]",
  // selector for items to launch the lightbox from
  showThumbs: true,
  // show thumbnails of other group images below current image
  showDescription: true,
  // show text description of image if available
  closeOnBgClick: true,
  // clicking the backdrop closes the modal
  // Gets the group attr/identifier from the link. Default attrs checked are data-simplebox,
  // data-fancybox, rel.
  // Return value is an object with `{attr: <attr-name>, group: <val>}`, or `null` if no group
  // was found. All objects in a given group must declare their group using the same attr.
  getGroup: (node) => {
    if (node.dataset.simplebox) {
      return { attr: "data-simplebox", group: node.dataset.simplebox };
    } else if (node.dataset.fancybox) {
      return { attr: "data-fancybox", group: node.dataset.simplebox };
    } else if (node.getAttribute("rel")) {
      return { attr: "rel", group: node.getAttribute("rel") };
    }
    return null;
  },
  // Gets the text description to show if `showDescription` is true. In order, looks for
  // `data-simplebox-description`, `alt`, `title`, and `aria-label` attrs on the element or
  // an <img> child.
  getDescription: (node) => {
    const img = node.querySelector("img");
    return node.dataset.simpleboxDescription || node.getAttribute("alt") || node.getAttribute("title") || node.getAttribute("aria-label") || img?.dataset?.simpleboxDescription || img?.getAttribute?.("alt") || img?.getAttribute?.("title") || img?.getAttribute?.("aria-label") || null;
  },
  // build the DOM content for the current node in the lightbox. Usually a simple <div> with an
  // <img> and optionally the img description, but videos are also recognized and youtube/vimeo urls
  // will be displayed as an embed.
  buildNodeContent: (node, config) => {
    let url = node.href;
    switch (hrefMediaType(url)) {
      case "image": {
        const rv = [];
        const img = document.createElement("img");
        img.setAttribute("src", url);
        rv.push(img);
        if (config.showDescription) {
          const desc = config.getDescription(node);
          if (desc) {
            const descEl = document.createElement("p");
            descEl.textContent = desc;
            rv.push(descEl);
          }
        }
        return rv;
      }
      case "vimeo": {
        const urlParsed = new URL(url);
        url = `https://player.vimeo.com/video${urlParsed.pathname}`;
        return buildIframe(url);
      }
      case "youtube": {
        const urlParsed = new URL(url);
        url = `https://www.youtube.com/embed/${extractYoutubeVideoId(url)}?enablejsapi=1&controls=1&modestbranding=1`;
        return buildIframe(url);
      }
      case "video": {
        const video = document.createElement("video");
        video.setAttribute("controls", "");
        video.setAttribute("src", url);
        return video;
      }
      case "file": {
        const iframe = document.createElement("iframe");
        return buildIframe(url);
      }
      default:
        throw new Error(`SimpleBox bug: no content handler for ${hrefMediaType(node.href)}`);
    }
  },
  // determine the URL to use as a thumbnail for a node. If the node contains an `<img/>`, use that
  // (on the assumption that that's probably already a smaller version of the full asset and already
  // loaded). Otherwise use the full-size asset, with fallback for non-image extensions.
  buildThumbnailUrl: (node) => {
    if (node.querySelector("img")) {
      return node.querySelector("img").src;
    } else if (hrefMediaType(node.href) === "image") {
      return node.href;
    } else {
      return file_default;
    }
  },
  // Build the thumbnail node for the thumbnail row below the primary lightbox content
  buildNodeThumbnail: (node, groupIdx, config) => {
    const anchor = document.createElement("a");
    anchor.classList.add("simplebox-modal__thumb");
    anchor.dataset.sbmGroupIdx = groupIdx;
    const thumb = document.createElement("img");
    thumb.setAttribute("src", config.buildThumbnailUrl(node));
    anchor.appendChild(thumb);
    return anchor;
  },
  templates: {
    closeBtn: `<button data-sbm-ref="close-btn" title="Close" aria-label="Close">${extractSvg(close_default)}</button>`,
    prevBtn: `<button data-sbm-ref="prev-btn" title="Previous" aria-label="Previous">${extractSvg(next_default)}</button>`,
    nextBtn: `<button data-sbm-ref="next-btn" title="Next" aria-label="Next">${extractSvg(next_default)}</button>`,
    modal: `
      <dialog class="simplebox-modal">
        <div class="simplebox-modal__outer-body">
          <div class="simplebox-modal__height-shim">
            <div class="simplebox-modal__inner-body">
              <div class="simplebox-modal__content-wrapper" data-sbm-ref="content-wrapper">
                <div class="simplebox-modal__content" data-sbm-ref="content"></div>
                <div class="simplebox-modal__thumbs" data-sbm-ref="thumbs"></div>
              </div>
              <div class="simplebox-modal__nav">$$tpl:prevBtn$$</div>
              <div class="simplebox-modal__nav">$$tpl:nextBtn$$</div>
            </div>
          </div>
          $$tpl:closeBtn$$
        </div>
      </dialog>
    `
  }
};
function q(root, selector) {
  if (selector === void 0) {
    selector = root;
    root = document;
  }
  if (!root.querySelectorAll) {
    return [];
  }
  return Array.from(root.querySelectorAll(selector));
}
var SBModal = class {
  constructor(config) {
    this.config = config;
    this._isOpen = false;
    this._rootEl = null;
    this.groupNodes = [];
    this.groupIdx = 0;
  }
  get isOpen() {
    return this._isOpen;
  }
  set isOpen(val) {
    this._isOpen = val;
    if (val) {
      this.rootEl.showModal();
    } else {
      this.rootEl.close();
    }
  }
  // convert a template string into a DOM node
  tpl = (tplName) => {
    if (!(tplName in this.config.templates)) {
      throw new Error(`Invalid SimpleBox template name '${tplName}'`);
    }
    let html = this.config.templates[tplName];
    while (html.includes("$$tpl:")) {
      html = html.replaceAll(/\$\$tpl:(\w+)\$\$/g, (_match, subTplName) => {
        if (!(subTplName in this.config.templates)) {
          throw new Error(`Invalid SimpleBox template name '${subTplName}'`);
        }
        return this.config.templates[subTplName];
      });
    }
    const template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstElementChild;
  };
  // lazily instantiated modal DOM
  get rootEl() {
    if (!this._rootEl) {
      this._rootEl = this.tpl("modal");
      this._rootEl.addEventListener("click", this.handleClick);
      document.body.append(this._rootEl);
    }
    return this._rootEl;
  }
  // collect all dom elements in the same group as the target node
  buildGroupNodes = (node) => {
    const { attr: groupAttr, group: groupId } = this.config.getGroup(node) || {};
    if (groupId) {
      const allNodes = q(this.config.selector);
      return q(`[${groupAttr}=${groupId}]`).filter((n) => allNodes.includes(n));
    } else {
      return [node];
    }
  };
  // open the modal, with the selected node as the currently shown content
  open = (node) => {
    this.groupNodes = this.buildGroupNodes(node);
    this.groupIdx = this.groupNodes.indexOf(node);
    if (this.groupIdx < 0) {
      throw new Error("Simplebox Bug. We somehow built a group without the original node.");
    }
    this.renderAll();
    this.isOpen = true;
  };
  selectGroupIdx = (idx) => {
    const transition = () => {
      this.groupIdx = idx;
      this.renderContent();
    };
    if (document.startViewTransition) {
      document.startViewTransition(transition);
    } else {
      transition();
    }
  };
  renderAll = () => {
    this.renderPrevNext();
    this.renderThumbnails();
    this.renderContent();
  };
  // update central content and the active thumbnail
  renderContent = () => {
    const container = this.rootEl.querySelector("[data-sbm-ref=content]");
    const content = this.config.buildNodeContent(this.groupNodes[this.groupIdx], this.config);
    if (Array.isArray(content)) {
      container.replaceChildren(...content);
    } else {
      container.replaceChildren(content);
    }
    const thumbs = this.rootEl.querySelector("[data-sbm-ref=thumbs]");
    q(thumbs, ".simplebox-modal__thumb").forEach((el) => {
      el.classList.remove("simplebox-modal__thumb--active");
    });
    const activeThumb = thumbs.querySelector(`[data-sbm-group-idx='${this.groupIdx}']`);
    if (activeThumb) {
      activeThumb.classList.add("simplebox-modal__thumb--active");
    }
  };
  // prev/next buttons are not shown if there's only one item in group, otherwise they are
  renderPrevNext = () => {
    q(this.rootEl, ".simplebox-modal__nav").forEach((el) => {
      if (this.groupNodes.length === 1) {
        el.style.setProperty("display", "none");
      } else {
        el.style.removeProperty("display");
      }
    });
  };
  // thumbnail row is shown if config.showThumbs and current group has > 1 item
  renderThumbnails = () => {
    const contentWrapper = this.rootEl.querySelector("[data-sbm-ref=content-wrapper]"), thumbsContainer = this.rootEl.querySelector("[data-sbm-ref=thumbs]");
    if (!this.config.showThumbs || this.groupNodes.length === 1) {
      contentWrapper.classList.add("simplebox-modal__content-wrapper--no-thumbs");
      thumbsContainer.replaceChildren();
    } else {
      contentWrapper.classList.remove("simplebox-modal__content-wrapper--no-thumbs");
      thumbsContainer.replaceChildren(
        ...this.groupNodes.map((n, idx) => this.config.buildNodeThumbnail(n, idx, this.config))
      );
    }
  };
  // handle clicks within the modal
  handleClick = (ev) => {
    if (this.config.closeOnBgClick && ev.target === this.rootEl) {
      ev.preventDefault();
      this.close();
    } else if (ev.target.matches("[data-sbm-ref=close-btn]") || ev.target.closest("[data-sbm-ref=close-btn]")) {
      ev.preventDefault();
      this.close();
    } else if (ev.target.matches("[data-sbm-ref=next-btn]") || ev.target.closest("[data-sbm-ref=next-btn]")) {
      ev.preventDefault();
      this.selectGroupIdx((this.groupIdx + 1) % this.groupNodes.length);
    } else if (ev.target.matches("[data-sbm-ref=prev-btn]") || ev.target.closest("[data-sbm-ref=prev-btn]")) {
      ev.preventDefault();
      this.selectGroupIdx(this.groupIdx === 0 ? this.groupNodes.length - 1 : this.groupIdx - 1);
    } else if (ev.target.matches(".simplebox-modal__thumb") || ev.target.closest(".simplebox-modal__thumb")) {
      ev.preventDefault();
      let anchor = ev.target;
      if (!anchor.matches(".simplebox-modal__thumb")) {
        anchor = anchor.closest(".simplebox-modal__thumb");
      }
      this.selectGroupIdx(anchor.dataset.sbmGroupIdx);
    }
  };
  close = () => {
    this.isOpen = false;
  };
};
var SBInstance = class {
  constructor(config) {
    this.config = config;
    this.modal = new SBModal(this.config);
  }
  start = () => {
    for (const n of q(this.config.selector)) {
      n.addEventListener("click", this.handleClick);
    }
    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (const n of mutation.addedNodes) {
          if (n.matches && n.matches(this.config.selector)) {
            n.addEventListener("click", this.handleClick);
          }
          for (const n2 of q(n, this.config.selector)) {
            n2.addEventListener("click", this.handleClick);
          }
        }
      });
    });
    this.mutationObserver.observe(document.body, { subtree: true, childList: true });
    return this;
  };
  handleClick = (ev) => {
    ev.preventDefault();
    let node = ev.target;
    if (!node.matches(this.config.selector)) {
      node = node.closest(this.config.selector);
    }
    this.modal.open(node);
  };
};
function SimpleBox(config) {
  config = { ...DEFAULT_CONFIG, ...config || {} };
  config.templates = { ...DEFAULT_CONFIG.templates, ...config?.templates || {} };
  return new SBInstance(config).start();
}
export {
  DEFAULT_CONFIG,
  SimpleBox
};
