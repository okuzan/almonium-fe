// Essential Audio Player v1.0.3
var Essential_Audio = (
  () => {
    var t = true;
    var f = false;
    var n = null;
    var A = {};
    var b = [];
    var c = f;
    var d = f;
    var h = 0;
    const g = [["mp3", "mpeg"], ["ogg", "ogg"], ["wav", "wav"], ["aac", "mpeg"], ["m4a", "mpeg"]];
    var j;
    var k;
    var l;
    var m = f;
    var o;
    var p;
    var q = 50;
    var pa = "div.essential_audio";
    var pb = "div:nth-child(1)";
    var pf = "mousemove";
    var pg = "touchmove";
    var ph = "mouseup";
    var pj = "touchend";
    // var pk = "?random=" + Math.floor(Math.random() * 1001);
    var pk = "";
    var pl = (a) => {
      return a.duration
    };
    var pm = (a) => {
      return a.currentTime
    };
    var pn = (a) => {
      return a.buffered
    };
    var po = () => {
      if (event.changedTouches) {
        l = event.changedTouches[0].pageX
      } else {
        l = event.pageX
      }
      return l
    };
    if (document.readyState != "loading") {
      B()
    } else {
      document.addEventListener("DOMContentLoaded", B)
    }


    function B() {
      var ia = document.querySelectorAll(pa);
      ia.forEach((vr, ib) => {
        vr.innerHTML = "<div><div class=\"off\"><!----></div></div><div><div><!----></div></div><div><!----></div>";
        var ic;
        if (vr.hasAttribute("id")) {
          ic = vr.getAttribute("id")
        } else {
          ic = ib + 1;
          vr.setAttribute("id", ic)
        }
        A[ic] = document.createElement("audio");
        var a = A[ic];
        a.id = ic;
        a.za = vr.querySelector(pb).querySelector("div");
        a.zb = a.za.offsetWidth;
        a.zc = vr.querySelector(pb).offsetWidth - a.zb;
        if (a.zc < 0) {
          a.zc = 0
        }
        a.zd = vr.getAttribute("data-url");
        a.ze = 0;
        a.zf = 0;
        a.zh = 0;
        a.zi = 0;
        a.zj = f;
        a.zks = 0;
        a.zl = f;
        a.zm = f;
        a.zn = f;
        a.zo = f;
        a.zp = f;
        a.zq = f;
        b[ib] = ic;
        a.crossOrigin = "anonymous";
        a.preload = "metadata";
        if (vr.hasAttribute("data-loop")) {
          a.loop = t
        }
        if (vr.hasAttribute("data-scratch")) {
          a.zr = t
        } else {
          a.zr = f
        }
        if (vr.hasAttribute("data-autoplay")) {
          if (h < 1) {
            h = 1;
            a.autoplay = t;
            a.preload = "auto";
            c = a;
            E(a)
          }
        }
        if (vr.hasAttribute("data-preload")) {
          if (!a.autoplay) {
            a.preload = "auto";
            E(a)
          }
        }
        a.za.onmousedown = (e) => {
          e.stopPropagation();
          e.preventDefault();
          Ba(a)
        };
        a.za.ontouchstart = (e) => {
          e.stopPropagation();
          e.preventDefault();
          Ba(a)
        };
        var ie = vr.querySelector("div:nth-child(3)");
        ie.onmousedown = (e) => {
          e.stopPropagation();
          e.preventDefault();
          Bb(a)
        };
        ie.ontouchstart = (e) => {
          e.stopPropagation();
          e.preventDefault();
          Bb(a)
        }
      })
    }

    function Ba(a) {
      a.zp = t;
      j = po();
      k = j - (a.za.getBoundingClientRect().left + window.scrollX);
      window.addEventListener(pf, Bc);
      var va = setTimeout(function () {
        window.addEventListener(pg, Bc)
      }, 100);

      function Bc() {
        if (j != po()) {
          m = t;
          if (a.zc > 0) {
            a.za.classList.add("drag")
          }
        }
        if (m && (a.zc > 0)) {
          o = po() - (a.za.parentNode.getBoundingClientRect().left + window.scrollX) - k;
          a.zh = Math.min(Math.max(o, 0), a.zc);
          a.za.style.left = a.zh + "px";
          if (a.zr && a.zn) {
            V(a);
            if (a.paused && (pm(a) != pl(a))) {
              a.play()
            }
          }
        }
      }window.addEventListener(ph, Bd);
      window.addEventListener(pj, Bd);

      function Bd() {
        window.removeEventListener(pf, Bc);
        window.removeEventListener(pg, Bc);
        clearTimeout(va);
        window.removeEventListener(ph, Bd);
        window.removeEventListener(pj, Bd);
        if (m) {
          if (pl(a) && (a.zc > 0)) {
            if (!a.zr || !a.zn) {
              V(a)
            }
            if (a.zn && a.paused && (pm(a) != pl(a))) {
              a.play()
            }
          }
          m = f;
          a.za.classList.remove("drag")
        } else {
          if (c.id && (c.id == a.id) && a.zn) {
            P(a)
          }
          if (!a.zl) {
            C(a)
          }
        }
        a.zp = f
      }
    }

    function Bb(a) {
      if (a.zc > 0) {
        a.zp = t;
        j = po();
        k = Math.floor(a.zb / 2);
        window.addEventListener(pf, Be);
        window.addEventListener(pg, Be);

        function Be() {
          m = t;
          a.za.classList.add("drag");
          o = po() - a.za.parentNode.getBoundingClientRect().left - k;
          a.zh = Math.min(Math.max(o, 0), a.zc);
          a.za.style.left = a.zh + "px";
          if (a.zr && a.zn) {
            V(a);
            if (a.paused && (pm(a) != pl(a))) {
              a.play()
            }
          }
        }window.addEventListener(ph, Bf);
        window.addEventListener(pj, Bf);

        function Bf() {
          window.removeEventListener(pf, Be);
          window.removeEventListener(pg, Be);
          window.removeEventListener(ph, Bf);
          window.removeEventListener(pj, Bf);
          if (m) {
            if (pl(a)) {
              if (!a.zr || a.zn) {
                V(a)
              }
              if (a.zn && a.paused && (pm(a) != pl(a))) {
                a.play()
              }
            }
            m = f;
            a.za.classList.remove("drag")
          } else {
            p = po() - a.za.parentNode.getBoundingClientRect().left - k;
            a.zh = Math.min(Math.max(p, 0), a.zc);
            a.za.style.left = a.zh + "px";
            if (pl(a)) {
              V(a);
              if (a.zn) {
                a.play()
              }
            }
          }
          a.zp = f
        }
      }
    }

    function C(a) {
      if (c) {
        if (a.id == c.id) {
          R();
          return
        } else {
          R()
        }
      }
      c = a;
      if (pl(a)) {
        O(a)
      } else {
        if (!a.zj) {
          a.play();
          a.pause();
          E(a)
        }
      }
    }

    function D(a, vq) {
      a.za.setAttribute("class", "");
      a.za.classList.add(vq)
    }

    function E(a) {
      D(a, "load");
      a.zj = t;
      a.zm = t;
      a.onplay = () => {
        if (!a.zm) {
          clearTimeout(a.td);
          D(a, "play")
        }
        if (a.id == d.id) {
          c = a;
          d = f;
          a.zn = t;
          if (a.zc > 0) {
            a.tc = setInterval(Q, q, a)
          }
        }
      };
      a.onplaying = () => {
        clearTimeout(a.td);
        D(a, "play")
      };
      a.onwaiting = () => {
        a.td = setTimeout(() => {
          D(a, "load")
        }, 50)
      };
      a.onpause = () => {
        if (!a.zm && !a.zp && !a.ended) {
          D(a, "off")
        }
        if (a.zn && !a.zm && !a.ended) {
          R()
        }
      };
      a.onended = () => {
        if (a.zc == 0 && !a.loop) {
          R(0)
        }
      };
      a.onseeking = () => {
        if (a.id == d.id) {
          P(a)
        }
      };
      a.onseeked = () => {
        if (a.id == d.id) {
          P(a)
        }
      };
      a.onloadedmetadata = () => {
        a.onloadedmetadata = n;
        J(a)
      };
      a.onprogress = () => {
        a.onprogress = n;
        a.ta = setInterval(U, 500, a);
        a.zq = t
      };
      var vc = a.zd.substr(a.zd.length - 4, a.zd.length);
      vc = vc.toLowerCase();
      var vd = f;
      for (var i = 0; i < g.length; i++) {
        if (vc == "." + g[i][0]) {
          var ve = a.zd + pk;
          F(a, ve, i);
          vd = t;
          break
        }
      }
      if (!vd) {
        g.forEach((vr, i) => {
          var ve = a.zd + "." + vr[0] + pk;
          F(a, ve, i)
        })
      }
    }

    function F(a, ve, vf) {
      var vg = new XMLHttpRequest;
      vg.onreadystatechange = () => {
        if (vg.readyState == 2) {
          vg.onreadystatechange = n;
          G(vg, a, ve, vf)
        }
      };
      vg.onerror = () => {
        G(vg, a, ve, vf)
      };
      vg.open("HEAD", ve);
      vg.send()
    }

    function G(vg, a, ve, vf) {
      if (vg.status == 200) {
        a.ze += 1;
        a.innerHTML += "<source id=\"" + g[vf][0] + "\" src=\"" + ve + "\" type=\"audio/" + g[vf][1] + "\" crossorigin=\"anonymous\">"
      } else {
        a.zf += 1;
        if ((g.length - a.zf) == 0) {
          H(a)
        }
      }
      vg.onerror = n
    }

    function H(a) {
      a.zj = f;
      a.zo = f;
      a.zn = f;
      a.zl = t;
      D(a, "error");
      if (a.id == c.id) {
        c = f
      }
    }

    function J(a) {
      if (a.preload == "auto") {
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
          a.preload = "metadata"
        }
        var vi = a.play();
        if (vi !== undefined) {
          vi.then(() => {
            if (a.autoplay) {
              M(a)
            } else {
              K(a)
            }
          }).catch(error => {
            K(a)
          })
        }
      } else {
        if (a.readyState > 2) {
          M(a)
        } else {
          V(a);
          if (a.zh == a.zc) {
            T(a)
          }
          a.tb = setInterval(L, 250, a)
        }
      }
    }

    function K(a) {
      a.pause();
      D(a, "off");
      a.currentTime = 0;
      a.zh = 0;
      a.zm = f;
      if (a.autoplay && c) {
        if (a.id == c.id) {
          d = c;
          c = f
        }
      }
    }

    function L(a) {
      V(a);
      var vj = 0;
      for (var i = 0; i < pn(a).length; i++) {
        if (pn(a).start(pn(a).length - 1 - i) <= pm(a)) {
          vj = pn(a).end(pn(a).length - 1 - i);
          break
        }
      }
      if (vj >= pm(a)) {
        clearInterval(a.tb);
        M(a)
      }
    }

    function M(a) {
      a.zj = f;
      a.zm = f;
      if (!a.zn) {
        if (!a.zo) {
          O(a)
        }
      } else {
        R(a)
      }
    }

    function O(a) {
      if (pm(a) == pl(a)) {
        T(a)
      }
      V(a);
      d = f;
      a.zn = t;
      if (a.zc > 0) {
        a.tc = setInterval(Q, q, a)
      }
      a.play();
      var vs = setTimeout(function () {
        if (a.zn && a.paused) {
          R()
        }
        clearTimeout(vs)
      }, 25);
      D(a, "play")
    }

    function N(vr) {
      if (!vr) {
        if (d) {
          vr = d.id
        } else {
          vr = b[0]
        }
      }
      var a = A[vr];
      if (!a.zn) {
        C(a)
      }
    }

    function Q(a) {
      if (!a.zp) {
        P(a);
        if (pm(a) == pl(a)) {
          if (a.loop) {
            T(a)
          } else {
            R(0)
          }
        }
      }
    }

    function P(a) {
      a.zh = Math.round(pm(a) * a.zc / pl(a));
      a.za.style.left = a.zh + "px"
    }

    function R(vp) {
      if (c) {
        clearInterval(c["tc"]);
        c.zo = t;
        c.zn = f;
        c.pause();
        D(c, "off");
        if (vp == 0) {
          T(c)
        } else {
          c.zh = c.za.offsetLeft
        }
        if (!c.zm) {
          d = c
        }
        c = f
      }
    }

    function T(a) {
      if (pl(a)) {
        a.currentTime = 0
      }
      a.zh = 0;
      a.za.style.left = 0 + "px"
    }

    function S(vr) {
      if (!vr) {
        if (d) {
          vr = d.id
        } else {
          vr = b[0]
        }
      }
      var a = A[vr];
      T(a)
    }

    function U(a) {
      if (pl(a)) {
        if (a.zc == 0) {
          var vk = 0
        } else {
          var vk = Math.round(a.zh / a.zc * pl(a) * 100) / 100
        }
        var vl = 0;
        for (var i = 0; i < pn(a).length; i++) {
          if (pn(a).start(pn(a).length - 1 - i) <= vk) {
            vl = pn(a).end(pn(a).length - 1 - i);
            break
          }
        }
        a.zi = Math.round(vl / pl(a) * 100);
        a.za.parentNode.parentNode.querySelector("div:nth-child(2)").querySelector("div").style.width = a.zi + "%";
        if (a.zi == 100) {
          clearInterval(a.ta);
          a.zq = f
        }
      }
    }

    function V(a) {
      if (a.zc > 0) {
        a.currentTime = a.zh / a.zc * pl(a)
      }
    }

    function W() {
      var vm = document.querySelectorAll(pa);
      vm.forEach((vr) => {
        var vn = vr.getAttribute("id");
        var a = A[vn];
        if (a.zq) {
          clearInterval(a.ta)
        }
        a.zb = a.za.offsetWidth;
        var vo = vr.querySelector(pb).offsetWidth - a.zb;
        if (vo < 0) {
          vo = 0
        }
        if ((a.za.offsetLeft > 0) && (vn != c.id)) {
          a.zh = Math.round(a.za.offsetLeft / a.zc * vo);
          a.za.style.left = a.zh + "px"
        }
        a.zc = vo;
        if (pl(a) && !a.zn) {
          V(a)
        }
        if (a.zq) {
          a.ta = setInterval(U, 500, a)
        }
      })
    }window.addEventListener("resize", W);
    return {init: B, Audio: A, Play: N, Stop: R, Reset: S, players: Xa, active: Xb, last: Xc};

    function Xa() {
      return b
    }

    function Xb() {
      if (c) {
        return c.id
      } else {
        return f
      }
    }

    function Xc() {
      if (d) {
        return d.id
      } else {
        return f
      }
    }
  })();
