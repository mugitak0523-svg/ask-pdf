(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[2955, 3548], {
    81611: () => {}
    ,
    16690: () => {}
    ,
    8615: () => {}
    ,
    46398: () => {}
    ,
    48468: () => {}
    ,
    23709: (e, t, r) => {
        Promise.resolve().then(r.bind(r, 66039)),
        Promise.resolve().then(r.bind(r, 54455)),
        Promise.resolve().then(r.t.bind(r, 69646, 23))
    }
    ,
    68443: (e, t, r) => {
        "use strict";
        r.d(t, {
            Cx: () => x,
            DB: () => v,
            o: () => g,
            ro: () => m
        });
        var n = r(62546)
          , i = r(37680)
          , a = r(4344)
          , l = r(78968)
          , s = r(59615)
          , o = r(50100)
          , c = r(90421)
          , d = r(73501)
          , u = r(21821)
          , h = r(23908)
          , p = r(68989)
          , f = r(90583);
        let m = () => {
            let e = (0,
            p.j)()
              , t = (0,
            f.Lg)()
              , r = (0,
            p.G)(e => e.account)
              , {sync: m} = r
              , g = (0,
            s.A)(r.fbAccount)
              , [x,v] = (0,
            l.useState)(!1);
            (0,
            l.useEffect)( () => {
                let e = () => setTimeout( () => window.focus(), 0);
                if (x)
                    return window.addEventListener("blur", e),
                    () => {
                        window.removeEventListener("blur", e)
                    }
            }
            , [x]),
            (0,
            i.BP)({
                prompt_parent_id: "one-tap-container",
                onSuccess(t) {
                    let r = a.HF.credential(t.credential);
                    (0,
                    a.eN)((0,
                    d.V)(), r).then(t => {
                        null != t.user && (e((0,
                        o.A5)({
                            event: "sign-in",
                            eventProps: {
                                method: "oneTap"
                            }
                        })),
                        e(h.$G.update({
                            lastSignInMethod: "oneTap"
                        })))
                    }
                    ).catch(console.error)
                },
                disabled: !x
            });
            let b = (0,
            s.A)(m);
            (0,
            l.useEffect)( () => {
                if (!window.location.pathname.startsWith("/auth"))
                    return (0,
                    d.V)().onAuthStateChanged(r => {
                        var i, a, l;
                        let s = null !== (i = g.current.anonId) && void 0 !== i ? i : h.Ew;
                        if (null != r) {
                            let t = n.rP.prefixLoggedInUser(r.uid);
                            e(h.$G.update({
                                fbAccount: {
                                    type: "loggedIn",
                                    anonId: s,
                                    userId: t,
                                    email: null !== (a = r.email) && void 0 !== a ? a : "",
                                    displayName: null !== (l = r.displayName) && void 0 !== l ? l : "",
                                    creationTime: r.metadata.creationTime ? new Date(r.metadata.creationTime).getTime() : 0
                                }
                            })),
                            e((0,
                            o._D)({
                                userId: t,
                                email: r.email,
                                displayName: r.displayName,
                                sync: b.current
                            })),
                            v(!1)
                        } else
                            (0,
                            c.fZ)() || window.location.pathname.endsWith("/admin") || v(!0),
                            t.current.account.meta.query({}).then(t => {
                                e(h.$G.setBucketInfo(t)),
                                e(h.$G.update({
                                    externalId: t.externalId
                                })),
                                (0,
                                u.rk)("set", "ContactInfo", null)
                            }
                            ).catch(),
                            e(h.$G.update({
                                fbAccount: {
                                    type: "loggedOut",
                                    anonId: s
                                }
                            }))
                    }
                    )
            }
            , [b, t, e, g])
        }
          , g = () => {
            let e = (0,
            p.G)(e => e.account.fbAccount);
            if ("loggedIn" === e.type)
                return e
        }
          , x = () => {
            var e;
            let t = (0,
            p.G)(e => e.account)
              , r = null !== (e = (0,
            h.vl)(t)) && void 0 !== e ? e : h.Ew
              , n = (0,
            h.Kk)(t);
            return {
                userId: n,
                anonId: r,
                isLoggedIn: v(),
                ficoUserId: null != n ? n : r
            }
        }
          , v = () => "loggedIn" === (0,
        p.G)(e => e.account).fbAccount.type
    }
    ,
    66039: (e, t, r) => {
        "use strict";
        r.d(t, {
            ChatPage: () => t9
        });
        var n = r(56148)
          , i = r(62546)
          , a = r(7555)
          , l = r(78968)
          , s = r(53257)
          , o = r(63109)
          , c = r(59615)
          , d = r(20621)
          , u = r(68989)
          , h = r(1936)
          , p = r(90583)
          , f = r(20300)
          , m = r(55307);
        (0,
        m.S)("~sources/processYoutubeUrlThunk", async e => {
            let {url: t} = e;
            return {
                chatId: i.rP.prefixChat((0,
                f.L)()),
                url: t
            }
        }
        );
        let g = (0,
        m.S)("~sources/tryFetchHighlightsThunk", async (e, t) => {
            let {sourceId: r} = e
              , {getState: n, dispatch: i} = t;
            if (null != n().sources.highlights[r])
                return;
            let a = await p.rP.source.getHighlights.query({
                sourceId: r
            });
            i(h.C.addHighlights({
                sourceId: r,
                highlights: a.data
            }))
        }
        )
          , x = (0,
        m.S)("~sources/addHighlightsThunk", async (e, t) => {
            let {sourceId: r, highlights: n} = e
              , {dispatch: i} = t;
            i(h.C.addHighlights({
                sourceId: r,
                highlights: n
            })),
            p.rP.source.addHighlights.mutate({
                sourceId: r,
                highlights: n
            })
        }
        )
          , v = (0,
        m.S)("~sources/removeHighlightsThunk", async (e, t) => {
            let {sourceId: r, highlightIds: n} = e
              , {dispatch: i} = t;
            i(h.C.removeHighlights({
                sourceId: r,
                highlightIds: n
            })),
            p.rP.source.removeHighlights.mutate({
                sourceId: r,
                highlightIds: n
            })
        }
        );
        var b = r(3256);
        let y = () => {
            let e = document.createElement("canvas")
              , t = window.devicePixelRatio || 1;
            return (r, n) => {
                let i = r.getBoundingClientRect()
                  , a = n.left * i.width / 100
                  , l = n.top * i.height / 100
                  , s = n.width * i.width / 100
                  , o = n.height * i.height / 100
                  , c = e.getContext("2d");
                return e.width = s,
                e.height = o,
                null == c || c.drawImage(r, a * t, l * t, s * t, o * t, 0, 0, s, o),
                e.toDataURL("image/png")
            }
        }
        ;
        var w = r(30924)
          , j = r.n(w)
          , k = function(e) {
            return e.NoSelection = "NoSelection",
            e.Selecting = "Selecting",
            e.Selected = "Selected",
            e.Selection = "Selection",
            e.ClickDragging = "ClickDragging",
            e.ClickDragged = "ClickDragged",
            e
        }({});
        let S = {
            height: 0,
            left: 0,
            pageIndex: -1,
            top: 0,
            width: 0
        }
          , C = {
            highlightAreas: [],
            selectionRegion: S,
            type: "NoSelection"
        }
          , N = {
            highlightAreas: [],
            selectionRegion: S,
            type: "Selecting"
        }
          , A = e => {
            let {canvasLayerRef: t, canvasLayerRendered: r, pageIndex: i, store: a, textLayerRef: s, textLayerRendered: o} = e
              , c = l.useRef(null)
              , d = l.useRef(document.body.style.cursor)
              , u = l.useRef({
                x: 0,
                y: 0
            })
              , h = l.useRef({
                top: 0,
                left: 0
            })
              , p = () => {
                let e = c.current;
                e && e.classList.add(j().clickDragHidden)
            }
              , f = e => {
                let t = s.current
                  , r = c.current;
                if (!e.altKey || !t || !r || 0 !== e.button)
                    return;
                e.preventDefault(),
                document.body.style.cursor = "crosshair";
                let n = t.getBoundingClientRect()
                  , i = {
                    x: e.clientX,
                    y: e.clientY
                };
                u.current = i;
                let l = {
                    top: (i.y - n.top) * 100 / n.height,
                    left: (i.x - n.left) * 100 / n.width
                };
                h.current = l,
                r.style.top = "".concat(l.top, "%"),
                r.style.left = "".concat(l.left, "%"),
                r.style.height = "0px",
                r.style.width = "0px",
                document.addEventListener("mousemove", m),
                document.addEventListener("mouseup", v),
                a.updateCurrentValue("highlightState", e => Object.assign({}, e, {
                    type: k.ClickDragging
                }))
            }
              , m = e => {
                let t = s.current
                  , r = c.current;
                if (!t || !r)
                    return;
                e.preventDefault();
                let n = {
                    x: e.clientX - u.current.x,
                    y: e.clientY - u.current.y
                }
                  , i = t.getBoundingClientRect();
                r.classList.contains(j().clickDragHidden) && r.classList.remove(j().clickDragHidden);
                let a = Math.min(100 - h.current.left, 100 * n.x / i.width)
                  , l = Math.min(100 - h.current.top, 100 * n.y / i.height);
                r.style.width = "".concat(a, "%"),
                r.style.height = "".concat(l, "%")
            }
              , g = e => {
                "Escape" === e.key && a.get("highlightState").type === k.ClickDragged && (e.preventDefault(),
                p(),
                a.update("highlightState", C))
            }
              , x = e => {
                let t = c.current;
                t && a.get("highlightState").type === k.NoSelection && e.target !== t && p()
            }
              , v = e => {
                e.preventDefault(),
                document.removeEventListener("mousemove", m),
                document.removeEventListener("mouseup", v),
                b();
                let r = c.current
                  , n = t.current;
                if (!r || !n)
                    return;
                let l = {
                    pageIndex: i,
                    top: parseFloat(r.style.top.slice(0, -1)),
                    left: parseFloat(r.style.left.slice(0, -1)),
                    height: parseFloat(r.style.height.slice(0, -1)),
                    width: parseFloat(r.style.width.slice(0, -1))
                }
                  , s = y()(n, l)
                  , o = {
                    highlightAreas: [l],
                    previewImage: s,
                    selectionRegion: l,
                    type: k.ClickDragged
                };
                a.update("highlightState", o)
            }
              , b = () => {
                d.current ? document.body.style.cursor = d.current : document.body.style.removeProperty("cursor")
            }
              , w = e => {
                (e.type === k.Selection || e.type === k.ClickDragging && e.selectionRegion.pageIndex !== i) && p()
            }
            ;
            return l.useEffect( () => (a.subscribe("highlightState", w),
            () => {
                a.unsubscribe("highlightState", w)
            }
            ), []),
            l.useEffect( () => {
                let e = t.current
                  , n = s.current;
                if (!r || !o || !e || !n)
                    return;
                n.addEventListener("mousedown", f);
                let i = {
                    capture: !0
                };
                return document.addEventListener("keydown", g),
                document.addEventListener("click", x, i),
                () => {
                    n.removeEventListener("mousedown", f),
                    document.removeEventListener("click", x, i),
                    document.removeEventListener("keydown", g)
                }
            }
            , [o]),
            (0,
            n.jsx)("div", {
                ref: c,
                className: "".concat(j().clickDrag, " ").concat(j().clickDragHidden)
            })
        }
        ;
        var E = r(49164)
          , I = r.n(E);
        let M = e => e >= 0 ? e : 360 + e
          , T = (e, t) => {
            switch (M(t)) {
            case 90:
                return {
                    height: "".concat(e.width, "%"),
                    position: "absolute",
                    right: "".concat(e.top, "%"),
                    top: "".concat(e.left, "%"),
                    width: "".concat(e.height, "%")
                };
            case 180:
                return {
                    bottom: "".concat(e.top, "%"),
                    height: "".concat(e.height, "%"),
                    position: "absolute",
                    right: "".concat(e.left, "%"),
                    width: "".concat(e.width, "%")
                };
            case 270:
                return {
                    height: "".concat(e.width, "%"),
                    position: "absolute",
                    left: "".concat(e.top, "%"),
                    bottom: "".concat(e.left, "%"),
                    width: "".concat(e.height, "%")
                };
            default:
                return {
                    height: "".concat(e.height, "%"),
                    position: "absolute",
                    top: "".concat(e.top, "%"),
                    left: "".concat(e.left, "%"),
                    width: "".concat(e.width, "%")
                }
            }
        }
          , P = (e, t) => {
            switch (M(t)) {
            case 90:
                return {
                    height: e.width,
                    left: e.top,
                    pageIndex: e.pageIndex,
                    top: 100 - e.width - e.left,
                    width: e.height
                };
            case 180:
                return {
                    height: e.height,
                    left: 100 - e.width - e.left,
                    pageIndex: e.pageIndex,
                    top: 100 - e.height - e.top,
                    width: e.width
                };
            case 270:
                return {
                    height: e.width,
                    left: 100 - e.height - e.top,
                    pageIndex: e.pageIndex,
                    top: e.left,
                    width: e.height
                };
            default:
                return e
            }
        }
          , R = e => {
            let {area: t, rotation: r} = e;
            return (0,
            n.jsx)("div", {
                className: I().selectedText,
                style: T(t, r)
            })
        }
          , _ = e => {
            let[t,r] = l.useState(e.get("rotation") || 0)
              , n = e => r(e);
            return l.useEffect( () => (e.subscribe("rotation", n),
            () => {
                e.unsubscribe("rotation", n)
            }
            ), []),
            {
                rotation: t
            }
        }
          , L = e => {
            let {pageIndex: t, renderHighlightContent: r, renderHighlightTarget: i, renderHighlights: a, store: s} = e
              , [o,c] = l.useState(s.get("highlightState"))
              , {rotation: d} = _(s)
              , u = e => c(e)
              , h = () => {
                var e;
                null === (e = window.getSelection()) || void 0 === e || e.removeAllRanges(),
                s.update("highlightState", C)
            }
            ;
            l.useEffect( () => (s.subscribe("highlightState", u),
            () => {
                s.unsubscribe("highlightState", u)
            }
            ), [s]);
            let p = o.type === k.Selection ? o.highlightAreas.filter(e => e.pageIndex === t) : [];
            return (0,
            n.jsxs)(n.Fragment, {
                children: [i && (o.type === k.Selected || o.type === k.ClickDragged) && o.selectionRegion.pageIndex === t && i({
                    highlightAreas: o.highlightAreas,
                    previewImage: o.previewImage || "",
                    selectedText: o.selectedText || "",
                    selectionRegion: o.selectionRegion,
                    selectionData: o.selectionData,
                    cancel: h,
                    toggle: () => {
                        var e;
                        let t = Object.assign({}, o, {
                            type: k.Selection
                        });
                        s.update("highlightState", t),
                        null === (e = window.getSelection()) || void 0 === e || e.removeAllRanges()
                    }
                }), r && o.type == k.Selection && o.selectionRegion.pageIndex === t && r({
                    highlightAreas: o.highlightAreas,
                    previewImage: o.previewImage || "",
                    selectedText: o.selectedText || "",
                    selectionRegion: o.selectionRegion,
                    selectionData: o.selectionData,
                    cancel: h
                }), p.length > 0 && (0,
                n.jsx)("div", {
                    children: p.map( (e, t) => (0,
                    n.jsx)(R, {
                        area: e,
                        rotation: d
                    }, t))
                }), a && a({
                    pageIndex: t,
                    rotation: d,
                    getCssProperties: T
                })]
            })
        }
          , z = "data-highlight-text-layer"
          , D = "data-highlight-text-page"
          , F = (e, t, r) => {
            try {
                let n = e.cloneNode(!0);
                e.parentNode.appendChild(n);
                let i = n.firstChild
                  , a = new Range;
                a.setStart(i, t),
                a.setEnd(i, r);
                let l = document.createElement("span");
                a.surroundContents(l);
                let s = l.getBoundingClientRect();
                return n.parentNode.removeChild(n),
                s
            } catch (e) {
                return console.warn("Error getting rect from offsets", e),
                new DOMRect
            }
        }
          , O = (e, t, r, n, i, a) => {
            if (r < i) {
                let l = e.slice(r, r + 1).map(e => e.textContent.substring(n).trim()).join(" ")
                  , s = e.slice(r + 1, i).map(e => e.textContent.trim()).join(" ")
                  , o = e.slice(i, i + 1).map(e => e.textContent.substring(0, a || e.textContent.length)).join(" ")
                  , c = "".concat(l, " ").concat(s, " ").concat(o);
                return {
                    divTexts: e.slice(r, i + 1).map( (e, n) => ({
                        divIndex: r + n,
                        pageIndex: t,
                        textContent: e.textContent
                    })),
                    wholeText: c
                }
            }
            {
                let i = e[r]
                  , l = i.textContent.substring(n, a || i.textContent.length).trim();
                return {
                    divTexts: [{
                        divIndex: r,
                        pageIndex: t,
                        textContent: i.textContent
                    }],
                    wholeText: l
                }
            }
        }
        ;
        var H = function(e) {
            return e.SameDiv = "SameDiv",
            e.DifferentDivs = "DifferentDivs",
            e.DifferentPages = "DifferentPages",
            e
        }({})
          , B = function(e) {
            return e.None = "None",
            e.TextSelection = "TextSelection",
            e
        }({});
        let W = ["", "\n"]
          , V = e => {
            let {store: t} = e
              , {rotation: r} = _(t)
              , i = l.useRef(null)
              , [a,s] = l.useState(!1)
              , [o,c] = l.useState(t.get("trigger"))
              , d = e => {
                let t = e();
                i.current = t,
                s(!!t)
            }
              , u = e => c(e)
              , h = async () => {
                await new Promise(e => setTimeout(e, 0));
                try {
                    let e, n, i;
                    let a = document.getSelection()
                      , l = t.get("highlightState");
                    if (!((l.type === k.NoSelection || l.type === k.Selected || l.type === k.Selecting) && a.rangeCount > 0 && -1 === W.indexOf(a.toString())))
                        return;
                    let s = a.getRangeAt(0)
                      , o = s.startContainer.parentNode
                      , c = s.endContainer.parentNode
                      , d = c instanceof HTMLElement && c.hasAttribute(z);
                    if (o && o.parentNode == s.endContainer ? n = (e = o).textContent.length : d && 0 == s.endOffset ? n = (e = s.endContainer.previousSibling).textContent.length : (e = d ? s.endContainer : c,
                    n = s.endOffset),
                    !(o instanceof HTMLElement) || !(e instanceof HTMLElement))
                        return;
                    let u = parseInt(o.getAttribute(D) || "", 10)
                      , h = parseInt(e.getAttribute(D) || "", 10)
                      , p = o.parentElement
                      , f = e.parentElement
                      , m = p.getBoundingClientRect()
                      , g = [].slice.call(p.querySelectorAll("[".concat(D, "]")))
                      , x = g.indexOf(o)
                      , v = f.getBoundingClientRect()
                      , b = [].slice.call(f.querySelectorAll("[".concat(D, "]")))
                      , y = b.indexOf(e)
                      , w = s.startOffset
                      , j = H.DifferentPages;
                    switch (!0) {
                    case u === h && x === y:
                        j = H.SameDiv;
                        break;
                    case u === h && x < y:
                        j = H.DifferentDivs;
                        break;
                    default:
                        j = H.DifferentPages
                    }
                    let S = (e, t, r) => Array(Math.max(t - e + 1, 0)).fill(0).map( (t, n) => r[e + n].getBoundingClientRect())
                      , C = [];
                    switch (j) {
                    case H.SameDiv:
                        let N = F(o, w, n);
                        C = [{
                            height: 100 * N.height / m.height,
                            left: (N.left - m.left) * 100 / m.width,
                            pageIndex: u,
                            top: (N.top - m.top) * 100 / m.height,
                            width: 100 * N.width / m.width
                        }];
                        break;
                    case H.DifferentDivs:
                        C = [F(o, w, o.textContent.length)].concat(S(x + 1, y - 1, g)).concat([F(e, 0, n)]).map(e => ({
                            height: 100 * e.height / m.height,
                            left: (e.left - m.left) * 100 / m.width,
                            pageIndex: u,
                            top: (e.top - m.top) * 100 / m.height,
                            width: 100 * e.width / m.width
                        }));
                        break;
                    case H.DifferentPages:
                        let A = [F(o, w, o.textContent.length)].concat(S(x + 1, g.length - 1, g)).map(e => ({
                            height: 100 * e.height / m.height,
                            left: (e.left - m.left) * 100 / m.width,
                            pageIndex: u,
                            top: (e.top - m.top) * 100 / m.height,
                            width: 100 * e.width / m.width
                        }))
                          , E = S(0, y - 1, b).concat([F(e, 0, n)]).map(e => ({
                            height: 100 * e.height / v.height,
                            left: (e.left - v.left) * 100 / v.width,
                            pageIndex: h,
                            top: (e.top - v.top) * 100 / v.height,
                            width: 100 * e.width / v.width
                        }));
                        C = A.concat(E)
                    }
                    let I = ""
                      , M = [];
                    switch (j) {
                    case H.SameDiv:
                        let T = O(g, u, x, w, x, n);
                        I = T.wholeText,
                        M = T.divTexts;
                        break;
                    case H.DifferentDivs:
                        let R = O(g, u, x, w, y, n);
                        I = R.wholeText,
                        M = R.divTexts;
                        break;
                    case H.DifferentPages:
                        let _ = O(g, u, x, w, g.length)
                          , L = O(b, h, 0, 0, y, n);
                        I = "".concat(_.wholeText, "\n").concat(L.wholeText),
                        M = _.divTexts.concat(L.divTexts)
                    }
                    if (C.length > 0)
                        i = C[C.length - 1];
                    else {
                        let t = e.getBoundingClientRect();
                        i = {
                            height: 100 * t.height / v.height,
                            left: (t.left - v.left) * 100 / v.width,
                            pageIndex: h,
                            top: (t.top - v.top) * 100 / v.height,
                            width: 100 * t.width / v.width
                        }
                    }
                    let B = {
                        divTexts: M,
                        selectedText: I,
                        startPageIndex: u,
                        endPageIndex: h,
                        startOffset: w,
                        startDivIndex: x,
                        endOffset: n,
                        endDivIndex: y
                    }
                      , V = {
                        type: k.Selected,
                        selectedText: I,
                        highlightAreas: C.map(e => P(e, r)),
                        selectionData: B,
                        selectionRegion: i
                    };
                    t.update("highlightState", V),
                    window.pdfViewerSelectedState = V
                } catch (e) {
                    console.warn("Error in Tracker onMouseUpHandler", e)
                }
            }
            ;
            return l.useEffect( () => {
                let e = i.current;
                if (e && o !== B.None)
                    return e.addEventListener("mouseup", h),
                    window.pdfViewerUpdateSelection = h,
                    () => {
                        e.removeEventListener("mouseup", h)
                    }
            }
            , [a, o, r]),
            l.useEffect( () => (t.subscribe("getPagesContainer", d),
            t.subscribe("trigger", u),
            () => {
                t.unsubscribe("getPagesContainer", d),
                t.unsubscribe("trigger", u)
            }
            ), []),
            (0,
            n.jsx)(n.Fragment, {})
        }
          , $ = I().selectedEnd
          , G = e => {
            let t = Object.assign({}, {
                trigger: B.TextSelection
            }, e)
              , r = l.useMemo( () => (0,
            b.createStore)({
                highlightState: C,
                trigger: t.trigger
            }), [])
              , i = e => t => {
                if (r.get("trigger") === B.None || 0 !== t.button)
                    return;
                let n = e.ele
                  , i = n.getBoundingClientRect()
                  , a = r.get("highlightState");
                if (!a)
                    return;
                if (a.type === k.Selected) {
                    let n = t.clientY - i.top
                      , s = t.clientX - i.left;
                    if (a.highlightAreas.filter(t => t.pageIndex === e.pageIndex).find(e => {
                        let t = e.top * i.height / 100
                          , r = e.left * i.width / 100
                          , a = e.height * i.height / 100
                          , l = e.width * i.width / 100;
                        return t <= n && n <= t + a && r <= s && s <= r + l
                    }
                    )) {
                        var l;
                        null === (l = window.getSelection()) || void 0 === l || l.removeAllRanges(),
                        r.update("highlightState", C)
                    } else
                        r.update("highlightState", N)
                } else
                    r.update("highlightState", C);
                let s = (t.clientY - i.top) * 100 / i.height
                  , o = n.querySelector(".".concat($));
                o && t.target !== n && (o.style.top = "".concat(Math.max(0, s), "%"))
            }
              , a = e => t => {
                if (r.get("trigger") === B.None)
                    return;
                let n = e.ele.querySelector(".".concat($));
                n && n.style.removeProperty("top")
            }
            ;
            return {
                install: e => {
                    r.update("jumpToDestination", e.jumpToDestination),
                    r.update("getPagesContainer", e.getPagesContainer)
                }
                ,
                onViewerStateChange: e => (r.update("rotation", e.rotation),
                e),
                onTextLayerRender: e => {
                    let t = i(e)
                      , r = a(e)
                      , n = e.ele;
                    if (e.status === b.LayerRenderStatus.PreRender) {
                        n.removeEventListener("mousedown", t),
                        n.removeEventListener("mouseup", r);
                        let e = n.querySelector(".".concat($));
                        e && n.removeChild(e)
                    } else if (e.status === b.LayerRenderStatus.DidRender && (n.addEventListener("mousedown", t),
                    n.addEventListener("mouseup", r),
                    n.setAttribute(z, "true"),
                    n.querySelectorAll(".rpv-core__text-layer-text").forEach(t => t.setAttribute(D, "".concat(e.pageIndex))),
                    !n.querySelector(".".concat($)))) {
                        let e = document.createElement("div");
                        e.classList.add($),
                        e.setAttribute("data-text", "false"),
                        n.appendChild(e)
                    }
                }
                ,
                renderPageLayer: e => (0,
                n.jsxs)(n.Fragment, {
                    children: [(0,
                    n.jsx)(A, {
                        canvasLayerRef: e.canvasLayerRef,
                        canvasLayerRendered: e.canvasLayerRendered,
                        pageIndex: e.pageIndex,
                        store: r,
                        textLayerRef: e.textLayerRef,
                        textLayerRendered: e.textLayerRendered
                    }), (0,
                    n.jsx)(L, {
                        pageIndex: e.pageIndex,
                        renderHighlightContent: t.renderHighlightContent,
                        renderHighlightTarget: t.renderHighlightTarget,
                        renderHighlights: t.renderHighlights,
                        store: r
                    })]
                }),
                renderViewer: e => {
                    let t = e.slot;
                    return t.subSlot && t.subSlot.children && (t.subSlot.children = (0,
                    n.jsxs)(n.Fragment, {
                        children: [(0,
                        n.jsx)(V, {
                            store: r
                        }), t.subSlot.children]
                    })),
                    t
                }
                ,
                jumpToHighlightArea: e => {
                    let t = r.get("jumpToDestination");
                    t && t({
                        pageIndex: e.pageIndex,
                        bottomOffset: (t, r) => (100 - e.top) * r / 100,
                        leftOffset: (t, r) => (100 - e.left) * t / 100
                    })
                }
                ,
                switchTrigger: e => {
                    r.update("trigger", e)
                }
            }
        }
          , U = {
            Yellow: "#ffeb3b",
            Green: "#4caf50",
            Red: "#f44336",
            Blue: "#2196f3",
            Pink: "#e91e63",
            Purple: "#9c27b0",
            Orange: "#ff9800"
        }
          , q = !1
          , X = e => {
            let {sourceId: t} = e
              , r = (0,
            u.j)()
              , i = (0,
            u.G)(e => t ? e.sources.highlights[t] : void 0)
              , a = (0,
            u.G)(e => t ? e.sources.refHighlights[t] : void 0);
            return (0,
            l.useEffect)( () => {
                null != t && null == i && r(g({
                    sourceId: t
                }))
            }
            , [r, i, t]),
            G({
                renderHighlights: (0,
                l.useCallback)(e => (0,
                n.jsxs)("div", {
                    className: "text-highlights",
                    style: {
                        zIndex: 2
                    },
                    children: [Object.entries(null != i ? i : {}).map(i => {
                        let[a,l] = i;
                        return Object.values(l.areas).filter(t => {
                            let[r] = t;
                            return r === e.pageIndex
                        }
                        ).map( (i, s) => {
                            let[o,c,d,u,h] = i;
                            return (0,
                            n.jsx)("div", {
                                onMouseOver: () => {
                                    q = !0
                                }
                                ,
                                onMouseOut: () => {
                                    q = !1
                                }
                                ,
                                onClick: () => {
                                    null != t && (r(v({
                                        sourceId: t,
                                        highlightIds: [a]
                                    })),
                                    q = !1)
                                }
                                ,
                                style: {
                                    cursor: "pointer",
                                    background: U[l.color],
                                    opacity: .175,
                                    ...e.getCssProperties({
                                        pageIndex: o,
                                        left: c,
                                        top: d,
                                        width: u,
                                        height: h
                                    }, e.rotation)
                                }
                            }, "manual-".concat(a, "-").concat(s))
                        }
                        )
                    }
                    ), null == a ? void 0 : a.filter(t => t.pageIndex === e.pageIndex).map( (t, r) => t.areas.map( (t, i) => (0,
                    n.jsx)("div", {
                        style: {
                            background: "rgba(23, 119, 255, 1)",
                            opacity: .1,
                            animation: "fade-highlight 0.3s ease-in",
                            pointerEvents: "none",
                            borderRadius: "2px",
                            ...e.getCssProperties({
                                pageIndex: t.pageIndex,
                                left: t.left,
                                top: t.top,
                                width: t.width,
                                height: t.height
                            }, e.rotation)
                        }
                    }, "ref-".concat(r, "-").concat(i))))]
                }), [i, a, r, t])
            })
        }
          , Y = !1
          , Z = () => Y;
        function K() {
            return (0,
            l.useEffect)(Q, []),
            null
        }
        function Q() {
            let e = new Map
              , t = new Map
              , r = new Map
              , n = new MutationObserver(function(n) {
                for (let o of n)
                    if ("childList" === o.type && o.removedNodes.forEach(n => {
                        let i = [];
                        (function e(t) {
                            let r = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : [];
                            r.push(t),
                            t.nodeType === Node.ELEMENT_NODE && t.childNodes.forEach(t => e(t, r))
                        }
                        )(n, i);
                        let a = i.find(e => {
                            var t;
                            return null === (t = e.classList) || void 0 === t ? void 0 : t.contains("rpv-core__inner-page")
                        }
                        );
                        if (a) {
                            var l, s;
                            let n = null === (s = a.getAttribute("aria-label")) || void 0 === s ? void 0 : null === (l = s.match(/\d+/)) || void 0 === l ? void 0 : l[0];
                            n && function(n) {
                                let i = r.get(n);
                                if (!i)
                                    return;
                                i.forEach(e => {
                                    e.remove(),
                                    t.delete(e)
                                }
                                ),
                                r.delete(n);
                                let a = e.get(n);
                                a && (window.clearTimeout(a),
                                e.delete(n))
                            }(n)
                        }
                    }
                    ),
                    "attributes" === o.type && "class" === o.attributeName) {
                        var i, a, l, s;
                        let n = o.target;
                        if ((null === (i = n.classList) || void 0 === i ? void 0 : i.contains("rpv-core__text-layer-text")) && (null === (a = n.textContent) || void 0 === a ? void 0 : a.trim()) !== "") {
                            let i = n.closest(".rpv-core__inner-page");
                            if (!i)
                                continue;
                            let a = null === (s = i.getAttribute("aria-label")) || void 0 === s ? void 0 : null === (l = s.match(/\d+/)) || void 0 === l ? void 0 : l[0];
                            if (!a)
                                continue;
                            e.has(a) && window.clearTimeout(e.get(a));
                            let o = window.setTimeout( () => {
                                !function(e) {
                                    let n = document.querySelectorAll('.rpv-core__inner-page[aria-label="Page '.concat(e, '"] span.rpv-core__text-layer-text'));
                                    if (0 === n.length)
                                        return;
                                    let i = n[0].offsetParent;
                                    if (!i)
                                        return;
                                    let a = i.getBoundingClientRect()
                                      , l = (function(e) {
                                        if (0 === e.length)
                                            return [];
                                        let {pageWidth: t, pageHeight: r} = e[0].rect
                                          , n = .01 * t
                                          , i = J(e, n, .65 / 100 * r);
                                        if (i.length < 5 || .75 >= function(e, t) {
                                            if (0 === e.length)
                                                return 0;
                                            let r = e.map(e => ee(e).height)
                                              , n = new Map;
                                            for (let e of r) {
                                                let r = !1;
                                                for (let[i,a] of n)
                                                    if (Math.abs(e - i) <= t) {
                                                        n.set(i, a + 1),
                                                        r = !0;
                                                        break
                                                    }
                                                r || n.set(e, 1)
                                            }
                                            return Math.max(...n.values()) / e.length
                                        }(i, .005 * r))
                                            return i;
                                        let a = J(e, n, .015 * r);
                                        return a.length < i.length ? a : i
                                    }
                                    )(Array.from(n).map( (e, t) => {
                                        let r = e.getBoundingClientRect()
                                          , n = window.getComputedStyle(e).transform
                                          , i = 1
                                          , l = 1;
                                        if (n && "none" !== n) {
                                            let e = n.match(/^matrix\(([^)]+)\)$/);
                                            if (e) {
                                                let t = e[1].split(",");
                                                t.length >= 4 && (i = parseFloat(t[0]),
                                                l = parseFloat(t[3]))
                                            }
                                        }
                                        let s = r.left - a.left
                                          , o = r.top - a.top
                                          , c = e.offsetWidth * i
                                          , d = e.offsetHeight * l;
                                        return {
                                            rect: {
                                                left: s,
                                                top: o,
                                                width: c,
                                                height: d,
                                                right: s + c,
                                                bottom: o + d,
                                                pageWidth: a.width,
                                                pageHeight: a.height
                                            },
                                            el: e,
                                            docIndex: t
                                        }
                                    }
                                    )).map(e => {
                                        let r = ee(e)
                                          , n = r.left - 6
                                          , a = r.top - 6
                                          , l = r.width + 12
                                          , s = r.height + 12
                                          , o = document.createElement("div");
                                        o.style.position = "absolute",
                                        o.style.borderRadius = "4px",
                                        o.style.backgroundColor = "transparent",
                                        o.style.zIndex = "-1",
                                        o.style.left = "".concat(n, "px"),
                                        o.style.top = "".concat(a, "px"),
                                        o.style.width = "".concat(l, "px"),
                                        o.style.height = "".concat(s, "px"),
                                        o.style.cursor = "pointer",
                                        o.className = "block-highlight";
                                        let c = e.map(e => e.el);
                                        return t.set(o, c),
                                        i.appendChild(o),
                                        o
                                    }
                                    );
                                    r.set(e, l)
                                }(a),
                                e.delete(a)
                            }
                            , 100);
                            e.set(a, o)
                        }
                    }
            }
            )
              , i = document.querySelector(".pdf-viewer");
            if (!i)
                return () => {}
                ;
            n.observe(i, {
                childList: !0,
                subtree: !0,
                attributes: !0,
                attributeFilter: ["class"]
            });
            let a = null
              , l = () => {
                if (!a)
                    return;
                let e = document.getElementById("selection-context-menu")
                  , t = (null == e ? void 0 : e.style.visibility) === "visible"
                  , r = null != document.getElementById("vision-select-rect");
                Z() || t || r ? (a.style.backgroundColor = "transparent",
                a.style.userSelect = "none") : a.style.backgroundColor = "#ccc"
            }
              , s = e => {
                let t = document.elementsFromPoint(e.clientX, e.clientY).find(e => {
                    var t;
                    return null === (t = e.classList) || void 0 === t ? void 0 : t.contains("block-highlight")
                }
                );
                t && t !== a ? (a && (a.style.backgroundColor = "transparent",
                a.style.userSelect = "none"),
                a = t) : !t && a && (a.style.backgroundColor = "transparent",
                a.style.userSelect = "none",
                a = null),
                l()
            }
              , o = null
              , c = e => {
                let t = e.target
                  , r = null !== t.closest(".toolbar")
                  , n = null !== t.closest("a");
                if (q || r || n)
                    return;
                let i = document.getElementById("selection-context-menu");
                (null == i ? void 0 : i.style.visibility) !== "visible" && (o = {
                    x: e.clientX,
                    y: e.clientY
                })
            }
              , d = e => {
                var r, n;
                setTimeout( () => l(), 0);
                let i = e.target
                  , s = null !== i.closest(".toolbar")
                  , c = null !== i.closest("a");
                if (!o || s || c)
                    return;
                let d = Math.abs(e.clientX - o.x)
                  , u = Math.abs(e.clientY - o.y);
                if (o = null,
                !(d < 4 && u < 4) || !a)
                    return;
                let h = null !== (r = t.get(a)) && void 0 !== r ? r : []
                  , p = h[0].firstChild
                  , f = h[h.length - 1].firstChild;
                if (p && f) {
                    let e = document.createRange();
                    e.setStart(p, 0),
                    e.setEnd(f, (null === (n = f.textContent) || void 0 === n ? void 0 : n.length) || 0);
                    let t = window.getSelection();
                    null == t || t.removeAllRanges(),
                    null == t || t.addRange(e),
                    window.pdfViewerUpdateSelection()
                }
            }
              , u = document.querySelector(".pdf-viewer");
            return null == u || u.addEventListener("mousemove", s),
            null == u || u.addEventListener("mousedown", c),
            null == u || u.addEventListener("mouseup", d),
            () => {
                n.disconnect(),
                e.forEach(e => window.clearTimeout(e)),
                e.clear(),
                null == u || u.removeEventListener("mousemove", s),
                null == u || u.removeEventListener("mousedown", c),
                null == u || u.removeEventListener("mouseup", d)
            }
        }
        function J(e, t, r) {
            return (function(e) {
                if (e.length <= 1)
                    return e;
                let t = [];
                for (let r = 0; r < e.length; r++) {
                    let n = e[r]
                      , i = 1 / 0
                      , a = -1 / 0;
                    for (let e of n)
                        e.docIndex < i && (i = e.docIndex),
                        e.docIndex > a && (a = e.docIndex);
                    t.push({
                        start: i,
                        end: a,
                        groupIndex: r
                    })
                }
                t.sort( (e, t) => e.start - t.start);
                let r = []
                  , n = [...e[t[0].groupIndex]]
                  , i = t[0].end;
                for (let a = 1; a < t.length; a++) {
                    let l = t[a];
                    l.start <= i ? (n.push(...e[l.groupIndex]),
                    l.end > i && (i = l.end)) : (r.push(n),
                    n = [...e[l.groupIndex]],
                    i = l.end)
                }
                for (let e of (r.push(n),
                r))
                    e.sort( (e, t) => e.docIndex - t.docIndex);
                return r
            }
            )(function(e, t, r) {
                if (0 === e.length)
                    return [];
                let {pageWidth: n, pageHeight: i} = e[0].rect;
                void 0 === t && (t = .01 * n),
                void 0 === r && (r = .65 / 100 * i);
                let a = new d.A
                  , l = e.map( (e, n) => ({
                    minX: e.rect.left - t,
                    minY: e.rect.top - r,
                    maxX: e.rect.right + t,
                    maxY: e.rect.bottom + r,
                    index: n
                }));
                a.load(l);
                let s = Array(e.length).fill(!1)
                  , o = [];
                for (let n = 0; n < e.length; n++) {
                    if (s[n])
                        continue;
                    let i = [n];
                    s[n] = !0;
                    let l = [e[n]];
                    for (; i.length > 0; ) {
                        let n = e[i.shift()].rect
                          , o = {
                            minX: n.left - t,
                            minY: n.top - r,
                            maxX: n.right + t,
                            maxY: n.bottom + r
                        };
                        for (let c of a.search(o)) {
                            let a = c.index;
                            !s[a] && function(e, t, r, n) {
                                let i = e.left <= t.right + r && e.right + r >= t.left
                                  , a = e.top <= t.bottom + n && e.bottom + n >= t.top;
                                return i && a
                            }(n, e[a].rect, t, r) && (s[a] = !0,
                            i.push(a),
                            l.push(e[a]))
                        }
                    }
                    o.push(l)
                }
                return o
            }(e, t, r)).flatMap(e => (function(e) {
                if (0 === e.length)
                    return [];
                if (1 === e.length)
                    return [e];
                let {pageWidth: t, pageHeight: r} = e[0].rect
                  , n = .01 * r
                  , i = []
                  , a = [e[0].rect.left];
                for (let t = 1; t < e.length; t++) {
                    let r = e[t]
                      , l = e[t - 1];
                    r.rect.top - l.rect.top > n && (i.push(t),
                    a.push(r.rect.left))
                }
                if (0 === i.length)
                    return [e];
                let l = Math.min(...e.map(e => e.rect.left))
                  , s = .002 * t;
                if (a.filter(e => e - l <= s).length / (i.length + 1) <= .5001)
                    return [e];
                let o = l + .01 * t
                  , c = l + .2 * t
                  , d = []
                  , u = [e[0]];
                for (let t = 1; t < e.length; t++) {
                    let r = e[t]
                      , i = e[t - 1];
                    r.rect.top - i.rect.top > n && r.rect.left > o && r.rect.left < c ? (d.push(u),
                    u = [r]) : u.push(r)
                }
                return u.length > 0 && d.push(u),
                d
            }
            )(e))
        }
        function ee(e) {
            let t = Math.min(...e.map(e => e.rect.left))
              , r = Math.min(...e.map(e => e.rect.top))
              , n = Math.max(...e.map(e => e.rect.right))
              , i = Math.max(...e.map(e => e.rect.bottom));
            return {
                left: t,
                top: r,
                right: n,
                bottom: i,
                width: n - t,
                height: i - r
            }
        }
        window.addEventListener("mousedown", () => {
            Y = !0
        }
        ),
        window.addEventListener("mouseup", () => {
            Y = !1
        }
        );
        var et = r(19404)
          , er = r.n(et)
          , en = r(28581)
          , ei = r(48180)
          , ea = r(82496)
          , el = r(13744)
          , es = r(1682);
        let eo = () => {
            let e = (0,
            a.useParams)();
            return (null == e ? void 0 : e.chat_id) != null ? i.rP.prefixChat(e.chat_id) : void 0
        }
          , ec = () => {
            let e = eo();
            return (0,
            u.G)(t => null == e ? void 0 : t.chats.chats[e])
        }
        ;
        var ed = r(12227)
          , eu = r(52526)
          , eh = r(36970)
          , ep = r(73501)
          , ef = r(50100)
          , em = r(93339)
          , eg = r(87132)
          , ex = r(95516)
          , ev = r(76412)
          , eb = r(39789);
        let ey = {
            Red: "#ff0000BB",
            Orange: "#ffa500BB",
            Yellow: "#ffff00BB",
            Green: "#00ff00BB",
            Blue: "#3399ffFF",
            Purple: "#8a2be2FF",
            Pink: "#ff69b4AA"
        }
          , ew = [{
            action: "explain",
            translateKey: "ContextMenuExplain",
            promptKey: "ContextMenuExplainPrompt"
        }, {
            action: "summarize",
            translateKey: "ContextMenuSummarize",
            promptKey: "ContextMenuSummarizePrompt"
        }, {
            action: "rewrite",
            translateKey: "ContextMenuRewrite",
            promptKey: "ContextMenuRewritePrompt"
        }]
          , ej = e => {
            let {chatId: t} = e
              , [r,a] = (0,
            l.useState)(!1)
              , s = ec()
              , o = (0,
            u.j)()
              , {visionSelect: c} = (0,
            u.G)(e => e.ui)
              , d = (0,
            ea.useTranslations)("PDFViewer")
              , h = l.useRef(!1)
              , p = l.useRef(!1)
              , m = (0,
            l.useCallback)( () => {
                p.current = !0,
                setTimeout( () => {
                    p.current = !1
                }
                , 200)
            }
            , [])
              , g = (0,
            l.useCallback)( () => {
                let e = document.getElementById("selection-context-menu");
                if (!e || p.current)
                    return;
                if (c.isActive && c.isFinished) {
                    let t = document.getElementById("vision-select-rect");
                    if (t) {
                        let r = t.getBoundingClientRect()
                          , n = (0,
                        en.A)(Math.max(r.left, r.right + window.scrollX - e.offsetWidth + 6), 0, window.innerWidth - 4 - e.offsetWidth)
                          , i = (0,
                        en.A)(r.top + window.scrollY - e.offsetHeight - 6, 50, window.innerHeight - 8 - e.offsetHeight);
                        e.style.left = "".concat(n, "px"),
                        e.style.top = "".concat(i, "px"),
                        e.style.visibility = "visible",
                        e.style.opacity = "1";
                        return
                    }
                }
                let t = window.getSelection();
                if (h.current || !t || 0 === t.rangeCount || t.toString().trim().length < 5) {
                    "visible" === e.style.visibility && m(),
                    e.style.visibility = "hidden",
                    e.style.opacity = "0";
                    return
                }
                let r = t.getRangeAt(0)
                  , n = r.commonAncestorContainer;
                if (n.nodeType === Node.TEXT_NODE && (n = n.parentNode),
                !(n instanceof Element && null != n.closest(".rpv-core__inner-pages"))) {
                    "visible" === e.style.visibility && m(),
                    e.style.visibility = "hidden",
                    e.style.opacity = "0";
                    return
                }
                let i = r.getBoundingClientRect();
                if (i.top > window.innerHeight || i.bottom < 0) {
                    "visible" === e.style.visibility && m(),
                    e.style.visibility = "hidden",
                    e.style.opacity = "0";
                    return
                }
                let a = (0,
                en.A)(Math.max(i.left, i.right + window.scrollX - e.offsetWidth + 6), 0, window.innerWidth - 4 - e.offsetWidth)
                  , l = (0,
                en.A)(i.top + window.scrollY - e.offsetHeight - 6, 50, window.innerHeight - 8 - e.offsetHeight);
                e.style.left = "".concat(a, "px"),
                e.style.top = "".concat(l, "px"),
                e.style.visibility = "visible",
                e.style.opacity = "1"
            }
            , [c, m]);
            (0,
            l.useEffect)( () => {
                g()
            }
            , [c, g]);
            let v = (0,
            l.useCallback)( () => {
                h.current = !0,
                g()
            }
            , [g])
              , b = (0,
            l.useCallback)( () => {
                h.current = !1,
                g()
            }
            , [g])
              , y = (0,
            l.useCallback)( (e, t) => {
                for (let r of e) {
                    let e = document.querySelector(r);
                    e && (e.removeEventListener("scroll", t),
                    e.addEventListener("scroll", t))
                }
            }
            , [])
              , w = (0,
            l.useCallback)( (e, t) => {
                let r = new MutationObserver(r => {
                    for (let n of r)
                        if ("childList" === n.type) {
                            y(e, t);
                            break
                        }
                }
                );
                return r.observe(document.body, {
                    childList: !0,
                    subtree: !0
                }),
                r
            }
            , [y])
              , j = (0,
            l.useCallback)(async e => {
                var r, n, i;
                let a = null !== (i = null === (r = window.getSelection()) || void 0 === r ? void 0 : r.toString().trim()) && void 0 !== i ? i : ""
                  , l = null === (n = ew.find(t => t.action === e)) || void 0 === n ? void 0 : n.promptKey;
                if (!l)
                    return;
                let s = "".concat(d(l), ":\n").concat(a);
                o((0,
                ef.A5)({
                    event: "selection-context-action",
                    eventProps: {
                        item: e,
                        selectionType: "text"
                    }
                })),
                o(eg.b.setViewMode({
                    chatId: t,
                    viewMode: "split"
                })),
                o((0,
                em.IN)({
                    chatId: t,
                    type: "standard",
                    msg: s
                }))
            }
            , [t, o, d])
              , k = (0,
            l.useCallback)(async e => {
                try {
                    var r;
                    a(!0);
                    let n = await ek(c.area)
                      , i = await eS(n)
                      , l = null === (r = ew.find(t => t.action === e)) || void 0 === r ? void 0 : r.promptKey;
                    if (!l)
                        return;
                    let s = "".concat(d(l), ": <|img/").concat(i, "|>");
                    o(eg.b.setViewMode({
                        chatId: t,
                        viewMode: "split"
                    })),
                    o((0,
                    em.IN)({
                        chatId: t,
                        type: "standard",
                        msg: s
                    })),
                    o((0,
                    ef.A5)({
                        event: "selection-context-action",
                        eventProps: {
                            item: e,
                            selectionType: "rect"
                        }
                    }))
                } catch (e) {
                    console.error(e),
                    (0,
                    eb.Ni)("Error capturing image")
                } finally {
                    a(!1),
                    o(ex.e5.resetVisionSelect())
                }
            }
            , [t, o, d, c.area])
              , S = (0,
            l.useCallback)(e => {
                var t, r;
                let n = null !== (r = null === (t = window.getSelection()) || void 0 === t ? void 0 : t.toString().trim()) && void 0 !== r ? r : ""
                  , i = null == s ? void 0 : s.sourceInViewer;
                if (null == i)
                    return;
                let a = window.pdfViewerSelectedState.highlightAreas
                  , l = (0,
                ei.A)(a.map(e => [(0,
                f.L)(6), [e.pageIndex, e.left, e.top, e.width, e.height]]));
                o(x({
                    sourceId: i,
                    highlights: {
                        [(0,
                        f.L)(6)]: {
                            type: "text",
                            text: n,
                            areas: l,
                            color: e
                        }
                    }
                })),
                o((0,
                ef.A5)({
                    event: "selection-context-action",
                    eventProps: {
                        item: "highlight",
                        selectionType: "text",
                        color: e
                    }
                }))
            }
            , [null == s ? void 0 : s.sourceInViewer, o])
              , C = (0,
            l.useCallback)(e => {
                try {
                    let t = function(e) {
                        let t = []
                          , r = document.querySelector(".rpv-core__viewer");
                        if (!r)
                            return t;
                        let n = r.getBoundingClientRect();
                        return r.querySelectorAll(".rpv-core__page-layer").forEach(r => {
                            var i;
                            let a = r.getBoundingClientRect()
                              , l = {
                                left: a.left - n.left,
                                top: a.top - n.top,
                                right: a.right - n.left,
                                bottom: a.bottom - n.top,
                                width: a.width,
                                height: a.height
                            }
                              , s = Math.max(e.x, l.left)
                              , o = Math.max(e.y, l.top)
                              , c = Math.min(e.x + e.width, l.right)
                              , d = Math.min(e.y + e.height, l.bottom);
                            if (c <= s || d <= o)
                                return;
                            let u = (s - l.left) / l.width * 100
                              , h = (o - l.top) / l.height * 100
                              , p = (c - s) / l.width * 100
                              , f = (d - o) / l.height * 100
                              , m = parseInt(null !== (i = r.getAttribute("data-virtual-index")) && void 0 !== i ? i : "0", 10);
                            t.push({
                                pageIndex: m,
                                left: u,
                                top: h,
                                width: p,
                                height: f
                            })
                        }
                        ),
                        t
                    }(c.area)
                      , r = (0,
                    ei.A)(t.map(e => [(0,
                    f.L)(6), [e.pageIndex, e.left, e.top, e.width, e.height]]))
                      , n = {
                        [(0,
                        f.L)(6)]: {
                            type: "rect",
                            areas: r,
                            color: e
                        }
                    }
                      , i = null == s ? void 0 : s.sourceInViewer;
                    if (null == i)
                        return;
                    o(ex.e5.resetVisionSelect()),
                    o(x({
                        sourceId: i,
                        highlights: n
                    })),
                    o((0,
                    ef.A5)({
                        event: "selection-context-action",
                        eventProps: {
                            item: "highlight",
                            selectionType: "rect",
                            color: e
                        }
                    }))
                } catch (e) {
                    console.error(e),
                    (0,
                    eb.Ni)("Error highlighting rect")
                }
            }
            , [null == s ? void 0 : s.sourceInViewer, o, c.area])
              , N = (0,
            l.useCallback)( () => {
                var e, r;
                let n = null !== (r = null === (e = window.getSelection()) || void 0 === e ? void 0 : e.toString().trim()) && void 0 !== r ? r : "";
                0 !== n.length && (o(eg.b.setViewMode({
                    chatId: t,
                    viewMode: "split"
                })),
                o(eg.b.setInput({
                    type: "set",
                    chatId: t,
                    msg: n
                })),
                o((0,
                ef.A5)({
                    event: "selection-context-action",
                    eventProps: {
                        item: "ask-question",
                        selectionType: "text"
                    }
                })))
            }
            , [t, o])
              , A = (0,
            l.useCallback)(async () => {
                try {
                    a(!0);
                    let e = await ek(c.area)
                      , [r,{base64: n, width: i, height: l}] = await Promise.all([eS(e), (0,
                    ev.Bb)(e, 92)]);
                    o(eg.b.setAttachedImage({
                        chatId: t,
                        imgId: r,
                        base64: n,
                        width: i,
                        height: l
                    })),
                    o(eg.b.setViewMode({
                        chatId: t,
                        viewMode: "split"
                    })),
                    o((0,
                    ef.A5)({
                        event: "selection-context-action",
                        eventProps: {
                            item: "ask-question",
                            selectionType: "rect"
                        }
                    }))
                } catch (e) {
                    console.error(e),
                    (0,
                    eb.Ni)("Error asking question about rect")
                } finally {
                    a(!1),
                    o(ex.e5.resetVisionSelect())
                }
            }
            , [t, o, c.area])
              , E = (0,
            l.useCallback)( () => {
                var e, t;
                let r = null !== (t = null === (e = window.getSelection()) || void 0 === e ? void 0 : e.toString().trim()) && void 0 !== t ? t : "";
                navigator.clipboard.writeText(r),
                (0,
                eb.GF)(d("ContextMenuCopyMessage")),
                o((0,
                ef.A5)({
                    event: "selection-context-action",
                    eventProps: {
                        item: "copy",
                        selectionType: "text"
                    }
                }))
            }
            , [o, d])
              , I = (0,
            l.useCallback)(async () => {
                try {
                    a(!0);
                    let e = await ek(c.area)
                      , t = Math.max(c.area.width, c.area.height)
                      , {base64: r} = await (0,
                    ev.Bb)(e, t)
                      , n = await fetch(r).then(e => e.blob());
                    await navigator.clipboard.write([new ClipboardItem({
                        [n.type]: n
                    })]),
                    (0,
                    eb.GF)(d("ContextMenuCopyMessage")),
                    o((0,
                    ef.A5)({
                        event: "selection-context-action",
                        eventProps: {
                            item: "copy",
                            selectionType: "rect"
                        }
                    }))
                } catch (e) {
                    console.error(e),
                    (0,
                    eb.Ni)("Error copying image")
                } finally {
                    a(!1),
                    o(ex.e5.resetVisionSelect())
                }
            }
            , [c.area, d, o]);
            return (0,
            l.useEffect)( () => {
                document.addEventListener("mousedown", v),
                document.addEventListener("mouseup", b);
                let e = w([".rpv-core__inner-pages", "#conversation"], g);
                return () => {
                    document.removeEventListener("mousedown", v),
                    document.removeEventListener("mouseup", b),
                    e.disconnect()
                }
            }
            , [g, v, b, w]),
            (0,
            l.useMemo)( () => (0,
            n.jsxs)("div", {
                id: "selection-context-menu",
                style: {
                    zIndex: 5e3,
                    position: "fixed",
                    borderRadius: 4,
                    display: "flex",
                    visibility: "hidden",
                    opacity: 0,
                    backgroundColor: "#252f35",
                    flexDirection: "column",
                    padding: "0 2px",
                    transition: "visibility 0.15s, opacity 0.15s"
                },
                children: [r && (0,
                n.jsx)("div", {
                    style: {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(37, 47, 53, 0.8)",
                        zIndex: 1
                    },
                    children: (0,
                    n.jsx)(ed.G, {})
                }), (0,
                n.jsx)("div", {
                    style: {
                        display: "flex"
                    },
                    children: ew.map( (e, t) => {
                        let {action: r, translateKey: i} = e;
                        return (0,
                        n.jsxs)(l.Fragment, {
                            children: [(0,
                            n.jsx)("div", {
                                className: "selection-context-menu-item",
                                style: {
                                    color: "#e4e6e8",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                    fontSize: "15px",
                                    lineHeight: "20px",
                                    padding: 8
                                },
                                onMouseDown: () => c.isActive ? k(r) : j(r),
                                children: d(i)
                            }), t < ew.length - 1 && (0,
                            n.jsx)("div", {
                                style: {
                                    borderRight: "1px solid rgb(99, 107, 112)",
                                    margin: "8px 0"
                                }
                            })]
                        }, i)
                    }
                    )
                }), (0,
                n.jsx)("div", {
                    style: {
                        borderBottom: "1px solid rgb(99, 107, 112)",
                        margin: "0 6px"
                    }
                }), (0,
                n.jsxs)("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        height: 32,
                        padding: "0 4px"
                    },
                    children: [i.Wp.objectEntries(ey).map(e => {
                        let[t,r] = e;
                        return (0,
                        n.jsx)("div", {
                            className: "selection-context-menu-item",
                            style: {
                                width: 16,
                                height: 16,
                                borderRadius: "50%",
                                backgroundColor: r,
                                margin: "0 4px",
                                cursor: "pointer"
                            },
                            onMouseDown: () => c.isActive ? C(t) : S(t)
                        }, t)
                    }
                    ), (0,
                    n.jsx)(eu.FicoTooltip, {
                        title: d("ContextMenuAskQuestion"),
                        placement: "bottom",
                        children: (0,
                        n.jsx)("div", {
                            className: "selection-context-menu-item icon-button",
                            style: {
                                fontSize: "16px",
                                lineHeight: "16px",
                                marginInlineStart: "auto"
                            },
                            children: (0,
                            n.jsx)(es.Z0O, {
                                onMouseDown: () => c.isActive ? A() : N(),
                                style: {
                                    color: "#e4e6e8"
                                }
                            })
                        })
                    }), (0,
                    n.jsx)(eu.FicoTooltip, {
                        title: c.isActive ? d("ContextMenuCopyImage") : d("ContextMenuCopyText"),
                        placement: "bottom",
                        children: (0,
                        n.jsx)("div", {
                            className: "selection-context-menu-item icon-button",
                            style: {
                                fontSize: "16px",
                                lineHeight: "16px",
                                marginInlineStart: 6,
                                marginInlineEnd: 4
                            },
                            children: (0,
                            n.jsx)(el.$G0, {
                                onMouseDown: () => c.isActive ? I() : E(),
                                style: {
                                    color: "#e4e6e8"
                                }
                            })
                        })
                    })]
                })]
            }), [r, d, c.isActive, k, j, C, S, A, N, I, E])
        }
          , ek = async e => {
            let t = document.querySelector(".rpv-core__viewer");
            if (!t)
                throw Error("Viewer not found");
            return await er()(t, {
                ...e,
                scale: 1,
                onclone: e => {
                    var t, r;
                    null === (t = e.styleSheets.item(0)) || void 0 === t || t.insertRule("* { box-shadow: none !important; }"),
                    null === (r = e.styleSheets.item(0)) || void 0 === r || r.insertRule(".vision-select-mask { display: none !important; }")
                }
            })
        }
          , eS = async e => {
            let[t,n] = await Promise.all([new Promise(t => e.toBlob(t)), r.e(7251).then(r.bind(r, 27251))]);
            if (!t)
                throw Error("Canvas is undefined");
            let i = n.getStorage((0,
            ep.r)(), eh.aF.auto)
              , a = "".concat((0,
            f.L)(8), "_").concat(e.width, "x").concat(e.height)
              , l = n.ref(i, "vision_uploads/".concat(a, ".png"));
            return await n.uploadBytes(l, t),
            a
        }
        ;
        var eC = r(2431)
          , eN = r(8013)
          , eA = r(23908)
          , eE = r(50575)
          , eI = r(90421)
          , eM = r(68443)
          , eT = r(88932)
          , eP = r(87558)
          , eR = r(38328)
          , e_ = r(93344)
          , eL = r(61066)
          , ez = r(99106)
          , eD = r(87143)
          , eF = r(15450)
          , eO = r(35991)
          , eH = r(41934)
          , eB = r(63214)
          , eW = r(49085);
        async function eV() {
            let e = window.getSelection();
            if (!e || 0 === e.rangeCount)
                return;
            let t = e.getRangeAt(0).cloneContents();
            t.querySelectorAll(".no-copy").forEach(e => e.remove());
            let r = document.createElement("div");
            r.appendChild(t);
            let n = r.innerHTML
              , i = (function e(t) {
                let r = arguments.length > 1 && void 0 !== arguments[1] && arguments[1]
                  , n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2]
                  , i = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 1
                  , a = new Set(["P", "DIV", "SECTION", "ARTICLE", "BR", "H1", "H2", "H3", "H4", "H5", "H6"])
                  , l = "";
                if (t.nodeType === Node.ELEMENT_NODE) {
                    if (t.classList.contains("no-copy"))
                        return {
                            text: "",
                            nextListNumber: i
                        };
                    if ("UL" === t.tagName)
                        t.childNodes.forEach(t => {
                            let r = e(t, !1, !0, i);
                            l += r.text,
                            i = r.nextListNumber
                        }
                        );
                    else if ("OL" === t.tagName) {
                        let r = 1;
                        t.childNodes.forEach(t => {
                            let n = e(t, !0, !1, r);
                            l += n.text,
                            r = n.nextListNumber
                        }
                        ),
                        i = r
                    } else if ("LI" === t.tagName) {
                        let a = "";
                        t.childNodes.forEach(t => {
                            let l = e(t, r, n, i);
                            a += l.text,
                            i = l.nextListNumber
                        }
                        ),
                        a = a.trim(),
                        n ? l += "- ".concat(a, "\n") : r ? (l += "".concat(i, ". ").concat(a, "\n"),
                        i++) : l += "".concat(a, "\n")
                    } else {
                        let s = "";
                        t.childNodes.forEach(t => {
                            let a = e(t, r, n, i);
                            s += a.text,
                            i = a.nextListNumber
                        }
                        ),
                        a.has(t.tagName) ? l += "".concat(s, "\n") : l += s
                    }
                } else
                    t.nodeType === Node.TEXT_NODE ? l += t.textContent : (t.nodeType === Node.DOCUMENT_FRAGMENT_NODE || t.nodeType === Node.DOCUMENT_NODE) && t.childNodes.forEach(t => {
                        let a = e(t, r, n, i);
                        l += a.text,
                        i = a.nextListNumber
                    }
                    );
                return {
                    text: l,
                    nextListNumber: i
                }
            }
            )(r).text.replace(/\n{3,}/g, "\n\n").trim();
            try {
                await navigator.clipboard.write([new ClipboardItem({
                    "text/html": new Blob([n],{
                        type: "text/html"
                    }),
                    "text/plain": new Blob([i],{
                        type: "text/plain"
                    })
                })])
            } catch (e) {
                await navigator.clipboard.writeText(i)
            }
        }
        let e$ = e => {
            (0,
            l.useEffect)( () => {
                if (null == e.current)
                    return;
                let t = e.current
                  , r = () => eV().catch();
                return t.addEventListener("copy", r),
                () => {
                    t.removeEventListener("copy", r)
                }
            }
            , [e])
        }
        ;
        var eG = r(8425)
          , eU = r(4186)
          , eq = r(71290)
          , eX = r(28966)
          , eY = r(6107)
          , eZ = r(4298)
          , eK = r(70041)
          , eQ = r(12030)
          , eJ = r(1405);
        let e0 = e => {
            let {chatId: t, children: r, onAfterSelectPrompt: i} = e
              , a = (0,
            u.j)()
              , {prompts: s, isLoading: o} = (0,
            u.G)(e => e.prompts)
              , c = (0,
            u.G)(e => e.ui.reopenSavedPromptsPopover)
              , [d,h] = (0,
            l.useState)(!1)
              , [p,f] = (0,
            l.useState)("")
              , [m,g] = (0,
            l.useState)(null)
              , x = (0,
            l.useRef)(null)
              , v = (0,
            eI.al)()
              , b = (0,
            ea.useTranslations)("Page.Chat");
            (0,
            l.useEffect)( () => {
                (null == c ? void 0 : c.chatId) === t && (h(!0),
                a(ex.e5.clearReopenSavedPromptsPopover()))
            }
            , [t, a, c]);
            let y = (0,
            l.useMemo)( () => Object.values(s).sort( (e, t) => t.updatedAt - e.updatedAt), [s])
              , w = (0,
            l.useMemo)( () => {
                if (!p.trim())
                    return y;
                let e = p.toLowerCase();
                return y.filter(t => t.content.toLowerCase().includes(e))
            }
            , [y, p])
              , j = 0 === y.length;
            (0,
            l.useEffect)( () => {
                d && (a((0,
                eJ.yh)()),
                f(""),
                v || setTimeout( () => {
                    var e;
                    return null === (e = x.current) || void 0 === e ? void 0 : e.focus()
                }
                , 100))
            }
            , [a, d, v]);
            let k = (0,
            l.useCallback)(e => {
                a(eg.b.setInput({
                    chatId: t,
                    type: "set",
                    msg: e.content
                })),
                h(!1),
                setTimeout( () => null == i ? void 0 : i(), 0)
            }
            , [a, t, i])
              , S = (0,
            l.useCallback)( (e, r) => {
                e.stopPropagation(),
                a(eQ.W.updateAndRaise({
                    editPrompt: {
                        promptId: r.id,
                        defaultContent: r.content,
                        source: "savedPromptsPopover",
                        chatId: t
                    }
                })),
                h(!1)
            }
            , [t, a])
              , C = (0,
            l.useCallback)( () => {
                a(eQ.W.updateAndRaise({
                    editPrompt: {
                        source: "savedPromptsPopover",
                        chatId: t
                    }
                })),
                h(!1)
            }
            , [t, a])
              , N = (0,
            l.useCallback)(e => {
                if (!p.trim())
                    return e;
                let t = p.toLowerCase()
                  , r = e.toLowerCase().indexOf(t);
                if (-1 === r)
                    return e;
                let i = e.slice(0, r)
                  , a = e.slice(r, r + p.length)
                  , l = e.slice(r + p.length);
                return (0,
                n.jsxs)(n.Fragment, {
                    children: [i, (0,
                    n.jsx)("span", {
                        className: "font-semibold",
                        children: a
                    }), l]
                })
            }
            , [p]);
            return (0,
            n.jsxs)(eK.AM, {
                open: d,
                onOpenChange: h,
                children: [(0,
                n.jsx)(eK.Wv, {
                    asChild: !0,
                    children: r({
                        isOpen: d
                    })
                }), v && (0,
                n.jsx)(eK.dT, {
                    className: "fixed left-1/2 bottom-20 h-0 w-0"
                }), (0,
                n.jsxs)(eK.hl, {
                    side: "top",
                    align: v ? "center" : "start",
                    alignOffset: v ? 0 : -100,
                    className: "w-[450px] max-w-[calc(100vw-2rem)] h-[250px] pl-1.5 pr-0 py-0 flex flex-col border border-border-default",
                    showArrow: !1,
                    children: [(0,
                    n.jsxs)("div", {
                        className: "flex items-center justify-between h-8 shrink-0 pr-2",
                        children: [(0,
                        n.jsx)("span", {
                            className: "text-sm font-medium leading-4 tracking-tight text-text-main py-2 pl-1.5",
                            children: b("SavedPrompts")
                        }), !j && (0,
                        n.jsx)(eH.F, {
                            size: "sm",
                            className: "text-text-subtle hover:text-text-main",
                            onClick: C,
                            title: b("CreateNewPrompt"),
                            children: (0,
                            n.jsx)(eq.A, {})
                        })]
                    }), j ? (0,
                    n.jsxs)("div", {
                        className: "flex-1 flex flex-col items-center justify-center text-center px-4",
                        children: [(0,
                        n.jsx)("p", {
                            className: "text-sm font-normal leading-tight tracking-tight text-text-subtle mb-4",
                            children: b("SavePromptsDescription")
                        }), (0,
                        n.jsxs)(eF.$, {
                            onClick: C,
                            className: "mb-4",
                            children: [(0,
                            n.jsx)(eq.A, {
                                className: "size-4"
                            }), b("CreateFirstPrompt")]
                        }), (0,
                        n.jsx)("p", {
                            className: "text-sm font-normal leading-tight tracking-tight text-text-subtle",
                            children: b("SavePromptsFromMessages")
                        })]
                    }) : (0,
                    n.jsxs)(n.Fragment, {
                        children: [(0,
                        n.jsx)("div", {
                            className: "pb-3 pr-2",
                            children: (0,
                            n.jsxs)("div", {
                                className: "relative",
                                children: [(0,
                                n.jsx)(eX.A, {
                                    className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-subtlest"
                                }), (0,
                                n.jsx)(eZ.p, {
                                    ref: x,
                                    value: p,
                                    onChange: e => f(e.target.value),
                                    placeholder: b("Search"),
                                    className: "pl-9 border-border-primary-subtle"
                                })]
                            })
                        }), (0,
                        n.jsx)("div", {
                            className: "flex-1 overflow-y-auto pr-0",
                            children: o ? (0,
                            n.jsx)("div", {
                                className: "py-6 text-center text-text-subtlest text-sm pr-2",
                                children: b("Loading")
                            }) : 0 === w.length ? (0,
                            n.jsx)("div", {
                                className: "py-6 text-center text-text-subtlest text-sm pr-2",
                                children: b("NoPromptsFound")
                            }) : (0,
                            n.jsx)("div", {
                                className: "flex flex-col pr-2",
                                children: w.map( (e, t) => (0,
                                n.jsxs)("div", {
                                    className: "flex items-center justify-between gap-3 py-2 pl-1.5 max-h-20 cursor-pointer before:absolute before:inset-0 before:rounded relative before:transition-colors ".concat(m === e.id ? "" : "hover:before:bg-state-layer-neutral-hover", " ").concat(t > 0 ? "border-t border-elevation-3" : ""),
                                    onClick: () => k(e),
                                    children: [(0,
                                    n.jsx)("span", {
                                        className: "text-sm font-normal leading-normal tracking-tight text-text-subtle line-clamp-3 whitespace-pre-line",
                                        children: N(e.content)
                                    }), (0,
                                    n.jsx)(eH.F, {
                                        size: "sm",
                                        className: "shrink-0 text-text-subtle hover:text-text-main",
                                        onPointerEnter: () => g(e.id),
                                        onPointerLeave: () => g(t => t === e.id ? null : t),
                                        onClick: t => S(t, e),
                                        title: b("EditPrompt"),
                                        children: (0,
                                        n.jsx)(eY.A, {
                                            className: "size-4"
                                        })
                                    })]
                                }, e.id))
                            })
                        })]
                    })]
                })]
            })
        }
        ;
        var e1 = r(34097)
          , e2 = r(53559);
        let e5 = e => {
            let {chatId: t, currChat: r} = e
              , i = (0,
            u.j)()
              , a = (0,
            ea.useTranslations)("Page.Chat")
              , s = (0,
            ea.useTranslations)("Shared")
              , o = (0,
            l.useCallback)( () => {
                i((0,
                ef.A5)({
                    event: "slides-open-outline-modal-button-click"
                })),
                i((0,
                em.b)({
                    chatOrSourceId: t,
                    cb: async () => {
                        i(eQ.W.updateAndRaise({
                            slideOutline: {
                                input: "chat",
                                chatId: t
                            }
                        }))
                    }
                }))
            }
            , [t, i])
              , c = (0,
            l.useCallback)( () => {
                i((0,
                ef.A5)({
                    event: "flashcard-button-click"
                })),
                i((0,
                em.b)({
                    chatOrSourceId: t,
                    cb: async () => {
                        i(eQ.W.updateAndRaise({
                            initFlashcards: {
                                input: "chat",
                                chatId: t,
                                displayName: r.info.displayName
                            }
                        }))
                    }
                }))
            }
            , [t, i, r.info.displayName]);
            return (0,
            n.jsxs)(eO.rI, {
                children: [(0,
                n.jsx)(eO.ty, {
                    asChild: !0,
                    children: (0,
                    n.jsx)(eH.F, {
                        size: "sm",
                        className: "border border-border-default",
                        children: (0,
                        n.jsx)(eq.A, {
                            className: "text-text-subtle"
                        })
                    })
                }), (0,
                n.jsxs)(eO.SQ, {
                    side: "top",
                    align: "start",
                    className: "font-normal",
                    children: [(0,
                    n.jsx)(eO.lp, {
                        children: a("AIActions")
                    }), (0,
                    n.jsxs)(eO._2, {
                        onClick: c,
                        className: "gap-2",
                        children: [(0,
                        n.jsx)(e2.cEV, {
                            className: "size-4"
                        }), s("Chat.CreateFlashcards")]
                    }), (0,
                    n.jsxs)(eO._2, {
                        onClick: o,
                        className: "gap-2",
                        children: [(0,
                        n.jsx)(e1.PDZ, {
                            className: "size-4"
                        }), a("CreatePowerPointSlides")]
                    })]
                })]
            })
        }
        ;
        var e4 = r(73165)
          , e8 = r(41281)
          , e6 = r(33218)
          , e3 = r(44272)
          , e9 = r(83747)
          , e7 = r(25319)
          , te = r(57882)
          , tt = r(91248)
          , tr = r(62925)
          , tn = r(9154)
          , ti = r(3928)
          , ta = r(87186)
          , tl = r(77352)
          , ts = r(50292)
          , to = r(99011)
          , tc = r(47486)
          , td = r(17142)
          , tu = r(97715)
          , th = r(98392);
        let tp = "chatMessageFeedback"
          , tf = e => {
            let {msg: t, chatId: r, isLastMessage: a, onCopy: s} = e
              , o = (0,
            u.j)()
              , c = (0,
            ea.useTranslations)("Page.Chat")
              , d = (0,
            p.Lg)()
              , h = (0,
            eM.DB)()
              , [f,m] = (0,
            l.useState)("")
              , [g,x] = (0,
            l.useState)(!1)
              , [v,b] = (0,
            l.useState)(null)
              , y = (0,
            td._)()
              , [w,j] = (0,
            l.useState)("idle")
              , k = (0,
            l.useRef)(null);
            (0,
            l.useEffect)( () => (k.current = new tu.K({
                onStatusChange: j,
                onError: e => {
                    console.error("Audio streaming error:", e),
                    (0,
                    eb.Ni)("There was an error playing the audio")
                }
            }),
            () => {
                k.current && (k.current.stopStreaming(),
                k.current = null)
            }
            ), []),
            (0,
            l.useEffect)( () => {
                let e = localStorage.getItem(tp);
                b((e ? JSON.parse(e) : {})[t.id] || null)
            }
            , [t.id]);
            let S = (0,
            l.useCallback)( (e, t) => {
                let r = JSON.parse(localStorage.getItem(tp) || "{}");
                null === t ? delete r[e] : r[e] = t,
                localStorage.setItem(tp, JSON.stringify(r)),
                b(t)
            }
            , [])
              , C = (0,
            l.useMemo)( () => ({
                isSignedIn: h,
                hasActiveSubscription: y,
                app: (0,
                tc.$o)(),
                userAgent: navigator.userAgent,
                language: navigator.language
            }), [h, y])
              , N = (0,
            l.useCallback)( () => {
                if ("like" === v) {
                    o((0,
                    ef.A5)({
                        event: "message-action-unlike"
                    })),
                    S(t.id, null),
                    x(!1);
                    return
                }
                o((0,
                ef.A5)({
                    event: "message-action-like"
                })),
                d.current.chat.saveChatMessageFeedback.mutate({
                    type: "feedbackChatMessage",
                    chatId: r,
                    msgId: t.id,
                    feedback: {
                        type: "like"
                    },
                    userInfo: C
                }),
                S(t.id, "like"),
                x(!1)
            }
            , [v, o, d, r, t.id, C, S])
              , A = (0,
            l.useCallback)( (e, n) => {
                d.current.chat.saveChatMessageFeedback.mutate({
                    type: "feedbackChatMessage",
                    chatId: r,
                    msgId: t.id,
                    feedback: {
                        type: "dislike",
                        reason: e,
                        reasonText: n
                    },
                    userInfo: C
                }),
                S(t.id, "dislike"),
                m(""),
                x(!1),
                (0,
                eb.GF)(c("ThanksForFeedback"))
            }
            , [d, r, t.id, S, C, c])
              , E = (0,
            l.useCallback)( () => {
                var e, r;
                "idle" === w ? (o((0,
                ef.A5)({
                    event: "message-action-readAloud-start"
                })),
                null === (e = k.current) || void 0 === e || e.startStreaming(t.msg)) : (o((0,
                ef.A5)({
                    event: "message-action-readAloud-stop"
                })),
                null === (r = k.current) || void 0 === r || r.stopStreaming())
            }
            , [w, t.msg, o])
              , I = (0,
            l.useCallback)(e => {
                let n = t.msg
                  , i = e;
                "shorter" === e ? i = c("ShorterPrompt", {
                    words: Math.round((0,
                    th.rj)(n) / 2)
                }) : "longer" === e ? i = c("LongerPrompt", {
                    words: 2 * (0,
                    th.rj)(n)
                }) : "bullets" === e ? i = c("ToBulletPointsPrompt") : "paragraphs" === e && (i = c("ToParagraphsPrompt"));
                let l = a ? i : "".concat(i, ":\n").concat(n);
                o((0,
                em.IN)({
                    chatId: r,
                    type: "standard",
                    msg: l
                }))
            }
            , [r, o, a, t.msg, c])
              , M = (0,
            l.useMemo)( () => [{
                key: "shorter",
                label: c("Shorter"),
                icon: (0,
                n.jsx)(tn.ThS, {}),
                onClick: () => {
                    o((0,
                    ef.A5)({
                        event: "message-action-settings",
                        eventProps: {
                            action: "shorter"
                        }
                    })),
                    I("shorter")
                }
            }, {
                key: "longer",
                label: c("Longer"),
                icon: (0,
                n.jsx)(tn.y7G, {}),
                onClick: () => {
                    o((0,
                    ef.A5)({
                        event: "message-action-settings",
                        eventProps: {
                            action: "longer"
                        }
                    })),
                    I("longer")
                }
            }, {
                type: "divider"
            }, {
                key: "bullets",
                label: c("ToBulletPoints"),
                icon: (0,
                n.jsx)(tl.Sax, {}),
                onClick: () => {
                    o((0,
                    ef.A5)({
                        event: "message-action-settings",
                        eventProps: {
                            action: "bullets"
                        }
                    })),
                    I("bullets")
                }
            }, {
                key: "paragraphs",
                label: c("ToParagraphs"),
                icon: (0,
                n.jsx)(ti.bb4, {}),
                onClick: () => {
                    o((0,
                    ef.A5)({
                        event: "message-action-settings",
                        eventProps: {
                            action: "paragraphs"
                        }
                    })),
                    I("paragraphs")
                }
            }], [I, c, o]);
            return (0,
            n.jsxs)("div", {
                className: "message-actions no-copy select-none mt-2 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-last:opacity-100 max-sm:opacity-100",
                children: [(0,
                n.jsx)(eF.$, {
                    icon: (0,
                    n.jsx)(e9.A, {}),
                    variant: "ghost",
                    className: "text-text-subtlest font-normal select-none text-sm",
                    size: "small",
                    onClick: () => {
                        o((0,
                        ef.A5)({
                            event: "message-action-copy"
                        })),
                        (0,
                        eb.GF)("Message copied to clipboard"),
                        s()
                    }
                    ,
                    children: c("Copy")
                }), (0,
                n.jsxs)(to.m_, {
                    children: [(0,
                    n.jsx)(to.k$, {
                        asChild: !0,
                        children: (0,
                        n.jsx)(eH.F, {
                            size: "sm",
                            onClick: N,
                            className: (0,
                            eG.cn)("text-text-subtlest transition-colors duration-200", "like" === v && "text-[#a026ff] hover:text-[#a026ff]"),
                            children: (0,
                            n.jsx)(e7.A, {})
                        })
                    }), (0,
                    n.jsx)(to.ZI, {
                        children: "like" === v ? c("Unlike") : c("Like")
                    })]
                }), (0,
                n.jsxs)(to.m_, {
                    children: [(0,
                    n.jsxs)(eK.AM, {
                        open: "dislike" !== v && g,
                        onOpenChange: x,
                        children: [(0,
                        n.jsx)(to.k$, {
                            asChild: !0,
                            children: (0,
                            n.jsx)(eK.Wv, {
                                asChild: !0,
                                children: (0,
                                n.jsx)(eH.F, {
                                    size: "sm",
                                    className: (0,
                                    eG.cn)("text-text-subtlest transition-colors duration-200", "dislike" === v && "text-[#a026ff] hover:text-[#a026ff]"),
                                    onClick: () => {
                                        "dislike" === v ? (S(t.id, null),
                                        x(!1)) : (o((0,
                                        ef.A5)({
                                            event: "message-action-dislike-button"
                                        })),
                                        x(!0))
                                    }
                                    ,
                                    children: (0,
                                    n.jsx)(te.A, {})
                                })
                            })
                        }), (0,
                        n.jsxs)(eK.hl, {
                            side: "top",
                            className: "p-3",
                            children: [(0,
                            n.jsx)("div", {
                                className: "flex flex-col gap-1",
                                children: Object.values(i.eQ.Values).map(e => (0,
                                n.jsx)(eF.$, {
                                    className: "w-full justify-start",
                                    onClick: () => {
                                        o((0,
                                        ef.A5)({
                                            event: "message-action-dislike",
                                            eventProps: {
                                                reason: e
                                            }
                                        })),
                                        A(e)
                                    }
                                    ,
                                    children: c("DislikeFeedbackReason.".concat(e))
                                }, e))
                            }), (0,
                            n.jsxs)("div", {
                                className: "mt-3 p-0",
                                children: [(0,
                                n.jsx)(ts.T, {
                                    placeholder: c("OtherFeedback"),
                                    rows: 2,
                                    className: "w-full",
                                    value: f,
                                    onChange: e => m(e.target.value),
                                    onKeyDown: e => {
                                        "Enter" !== e.key || e.shiftKey || (e.preventDefault(),
                                        o((0,
                                        ef.A5)({
                                            event: "message-action-dislike",
                                            eventProps: {
                                                text: f
                                            }
                                        })),
                                        A(void 0, f))
                                    }
                                }), (0,
                                n.jsx)(eF.$, {
                                    variant: "primary",
                                    className: "mt-2 w-full",
                                    onClick: () => {
                                        o((0,
                                        ef.A5)({
                                            event: "message-action-dislike",
                                            eventProps: {
                                                text: f
                                            }
                                        })),
                                        A(void 0, f)
                                    }
                                    ,
                                    disabled: !f,
                                    children: c("Submit")
                                })]
                            })]
                        })]
                    }), (0,
                    n.jsx)(to.ZI, {
                        children: "dislike" === v ? c("UndoDislike") : c("Dislike")
                    })]
                }), (0,
                n.jsxs)(to.m_, {
                    children: [(0,
                    n.jsx)(to.k$, {
                        asChild: !0,
                        children: (0,
                        n.jsx)(eH.F, {
                            size: "sm",
                            className: "text-text-subtlest",
                            onClick: E,
                            children: "loading" === w ? (0,
                            n.jsx)("div", {
                                className: "w-[14px] h-[14px] overflow-hidden flex items-center justify-center",
                                children: (0,
                                n.jsx)(ed.G, {
                                    className: "w-[10px] h-[10px] mt-[2px] ms-[2px]"
                                })
                            }) : "playing" === w ? (0,
                            n.jsx)(ta.usT, {
                                style: {
                                    color: "#a026ff"
                                }
                            }) : (0,
                            n.jsx)(tt.A, {})
                        })
                    }), (0,
                    n.jsx)(to.ZI, {
                        children: "playing" === w ? c("StopPlaying") : c("ReadAloud")
                    })]
                }), (0,
                n.jsxs)(eO.rI, {
                    children: [(0,
                    n.jsx)(eO.ty, {
                        asChild: !0,
                        children: (0,
                        n.jsx)(eH.F, {
                            size: "sm",
                            className: "text-text-subtlest",
                            onClick: () => o((0,
                            ef.A5)({
                                event: "message-action-settings-open"
                            })),
                            children: (0,
                            n.jsx)(tr.A, {})
                        })
                    }), (0,
                    n.jsx)(eO.SQ, {
                        side: "top",
                        align: "center",
                        children: M.map( (e, t) => "divider" === e.type ? (0,
                        n.jsx)(eO.mB, {}, "divider-".concat(t)) : (0,
                        n.jsxs)(eO._2, {
                            onClick: () => {
                                var t;
                                return null === (t = e.onClick) || void 0 === t ? void 0 : t.call(e)
                            }
                            ,
                            children: [(0,
                            n.jsx)("span", {
                                children: e.icon
                            }), e.label]
                        }, e.key))
                    })]
                })]
            })
        }
        ;
        var tm = r(72757);
        let tg = e => {
            let {messageText: t, onCopy: r} = e
              , i = (0,
            u.j)()
              , a = (0,
            ea.useTranslations)("Page.Chat")
              , s = (0,
            l.useCallback)( () => {
                i((0,
                ef.A5)({
                    event: "message-action-save-prompt"
                })),
                i(eQ.W.updateAndRaise({
                    editPrompt: {
                        defaultContent: t
                    }
                }))
            }
            , [i, t]);
            return (0,
            n.jsxs)("div", {
                className: "message-actions no-copy select-none mt-2 flex items-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-last:opacity-100 max-sm:opacity-100",
                children: [(0,
                n.jsx)(eF.$, {
                    icon: (0,
                    n.jsx)(e9.A, {}),
                    variant: "ghost",
                    className: "text-text-subtlest font-normal select-none text-sm px-0.5",
                    size: "small",
                    onClick: () => {
                        i((0,
                        ef.A5)({
                            event: "message-action-copy"
                        })),
                        (0,
                        eb.GF)(a("MessageCopied")),
                        r()
                    }
                    ,
                    children: a("Copy")
                }), (0,
                n.jsxs)(to.m_, {
                    children: [(0,
                    n.jsx)(to.k$, {
                        asChild: !0,
                        children: (0,
                        n.jsx)(eH.F, {
                            size: "sm",
                            className: "text-text-subtlest",
                            onClick: s,
                            children: (0,
                            n.jsx)(tm.A, {
                                className: "size-6"
                            })
                        })
                    }), (0,
                    n.jsx)(to.ZI, {
                        children: a("SaveThisPrompt")
                    })]
                })]
            })
        }
        ;
        var tx = r(20398);
        let tv = new (r(44241)).B
          , tb = e => tv.next(e);
        var ty = r(70278);
        r(81822);
        let tw = e => {
            let t = e.trim();
            if (/\n/.test(t))
                return !1;
            let r = /\\[a-zA-Z]+/.test(t)
              , n = /[_^]/.test(t)
              , i = /\{.*\}/.test(t)
              , a = /[=<>]/.test(t)
              , l = /^[a-zA-Z]$/.test(t)
              , s = /^\d+$/.test(t)
              , o = /^[a-zA-Z]([,\s]+[a-zA-Z])+$/.test(t)
              , c = /^[A-Z]{2,}\([^)]+\)$/.test(t);
            return !(/^\d{1,3}[,.]?\d{3}/.test(t) && !r || /^\d/.test(t) && !s && !r && !n && !i) && (r || n || i || a ? !(t.length > 500) : !(t.length > 50) && !(t.split(/\s+/).length > 8) && (!!l || !!s || !!o || !!c))
        }
          , tj = e => {
            if (!e)
                return "";
            let t = []
              , r = e.replace(/\$\$[\s\S]*?\$\$/g, e => (t.push(e),
            "__DISPLAY_MATH_".concat(t.length - 1, "__")));
            return (r = (r = r.replace(/`\$([^`]*)\$`/g, (e, t) => "$$".concat(t, "$$"))).replace(/\$([^$]+)\$/g, (e, t) => tw(t) ? "$$".concat(t, "$$") : e)).replace(/__DISPLAY_MATH_(\d+)__/g, (e, r) => t[Number(r)])
        }
          , tk = e => e.replace(/\(\s*T\s*\d+\s*(?:,\s*T\s*\d+\s*)*\)/g, e => {
            let t = e.slice(1, -1).replace(/\s+/g, "").replace(/T(\d+)/g, "T$1");
            return "[".concat(t, "]")
        }
        ).replace(/【\s*T\s*\d+\s*(?:,\s*T\s*\d+\s*)*】/g, e => {
            let t = e.slice(1, -1).replace(/\s+/g, "").replace(/T(\d+)/g, "T$1");
            return "[".concat(t, "]")
        }
        )
          , tS = (e, t) => {
            var r, n, i;
            if (!t)
                return e;
            if (e.endsWith("["))
                return e.slice(0, -1);
            if (e.endsWith("[ ") || e.endsWith("[T") || e.endsWith("[R"))
                return e.slice(0, -2);
            if (e.endsWith("[ T") || e.endsWith("[ R"))
                return e.slice(0, -3);
            let a = null !== (i = null === (n = e.match(/\d+$/)) || void 0 === n ? void 0 : null === (r = n[0]) || void 0 === r ? void 0 : r.length) && void 0 !== i ? i : 0;
            if (a > 0) {
                let t = e.slice(-a - 3, -a)
                  , r = e.slice(-a - 2, -a);
                if ("[ T" === t || "[ R" === t)
                    return e.slice(0, -a - 3);
                if ("[T" === r || "[R" === r)
                    return e.slice(0, -a - 2)
            }
            return e
        }
          , tC = e => null == e ? "" : e.replace(/Texto? (\d+)/gi, (e, t) => "[T".concat(t, "]"))
          , tN = e => e ? e.replace(/\[\s*(?:T|R)\s*\d+\s*(?:[,;]\s*(?:T|R)\s*\d+\s*)*\]/g, e => e.replace(/\s+/g, "").replace(/[,;]\s*/g, "] [")) : ""
          , tA = e => {
            let t = e.replace(/\[\s*R\s*(\d+)\s*[-－−–—]\s*R?\s*\d+\s*\]/g, (e, t) => "[R".concat(t, "]"));
            return (t = (t = t.replace(/\[\s*T\s*(\d+)\s*[-－−–—]\s*T?\s*\d+\s*\]/g, (e, t) => "[T".concat(t, "]"))).replace(/(\[\s*R\s*\d+\s*\])(?:\s*\[\s*R\s*\d+\s*\])+/g, "$1")).replace(/(\[\s*T\s*\d+\s*\])(?:\s*\[\s*T\s*\d+\s*\])+/g, "$1")
        }
          , tE = (e, t) => {
            if (!e)
                return "";
            let r = 0
              , n = "summary" === t;
            return e.split("\n").map(e => {
                let t = e.trim();
                if (t.startsWith("\xbf") && t.endsWith("?")) {
                    let e = t.replace(/<\/?q>/g, "");
                    return 0 != r++ || n ? "\nACTION: ".concat(e) : "\nACTION[SUMMARY]: ".concat(e)
                }
                return t.startsWith("<q>") ? t.endsWith("</q>") ? t.replace(/<q>(.*?)<\/q>/g, (e, t) => 0 != r++ || n ? "\nACTION: ".concat(t) : "\nACTION[SUMMARY]: ".concat(t)) : null : t
            }
            ).filter(e => null != e).join("\n")
        }
        ;
        function tI(e, t, r, n, i, a) {
            let l = 1 / 0
              , s = -1 / 0
              , o = 1 / 0
              , c = -1 / 0;
            for (let e of t) {
                let t = e.getBoundingClientRect()
                  , n = t.left - r.left
                  , i = t.top - r.top
                  , a = n + t.width
                  , d = i + t.height;
                l = Math.min(l, n),
                s = Math.max(s, a),
                o = Math.min(o, i),
                c = Math.max(c, d)
            }
            if (l === 1 / 0 || s === -1 / 0)
                return;
            let d = Math.max(0, l / n * 100 - 1)
              , u = Math.max(0, o / i * 100 - .3)
              , h = Math.min(100 - d, (s - l) / n * 100 + 2)
              , p = Math.min(100 - u, (c - o) / i * 100 + .6);
            e.push({
                pageIndex: a,
                left: d,
                top: u,
                width: h,
                height: p
            })
        }
        function tM(e, t, r) {
            let n = ""
              , i = null === t
              , a = e => {
                if (e === r)
                    return !0;
                if (e === t)
                    return i = !0,
                    !1;
                if (e.nodeType === Node.TEXT_NODE)
                    return i && (n += e.textContent || ""),
                    !1;
                if (e.nodeType === Node.ELEMENT_NODE) {
                    var l;
                    if (null === (l = e.classList) || void 0 === l ? void 0 : l.contains("no-copy"))
                        return !1;
                    for (let t of Array.from(e.childNodes))
                        if (a(t))
                            return !0
                }
                return !1
            }
            ;
            return a(e),
            n
        }
        function tT(e) {
            return RegExp("[\\p{L}\\p{N}]", "u").test(e)
        }
        async function tP(e) {
            let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 2e4
              , r = Date.now()
              , n = null
              , a = '.rpv-core__inner-page[aria-label="Page '.concat(e + 1, '"]')
              , l = document.querySelector(a);
            for (; Date.now() - r < t; ) {
                if (l = document.querySelector(a)) {
                    let e = l.querySelector(".rpv-core__text-layer");
                    if (e) {
                        null === n && (n = Date.now());
                        let t = Array.from(e.querySelectorAll('span.rpv-core__text-layer-text:not([data-text="false"]), br.rpv-core__text-layer-text'));
                        if (null !== n && 0 === t.length && Date.now() - n >= 500)
                            return {
                                pageText: "",
                                textLayer: null
                            };
                        let r = []
                          , i = "";
                        for (let e of t)
                            if ("BR" === e.tagName)
                                i.trim() && (r.push(i.trim()),
                                i = "");
                            else if ("SPAN" === e.tagName) {
                                var s;
                                let t = null === (s = e.textContent) || void 0 === s ? void 0 : s.trim();
                                t && (i += t + " ")
                            }
                        i.trim() && r.push(i.trim());
                        let a = r.join("\n");
                        if (a.trim())
                            return {
                                pageText: a,
                                textLayer: e
                            }
                    }
                }
                await i.Wp.sleep(10)
            }
            return {
                pageText: "",
                textLayer: null
            }
        }
        let tR = new Map;
        async function t_(e) {
            let {bubbleId: t, sourceId: r, pageIndex: n, dispatch: i} = e;
            i(h.C.setRefHighlights({
                sourceId: r,
                highlights: []
            }));
            let a = function(e) {
                let t = document.getElementById(e);
                if (!t)
                    return "";
                let r = ["P", "DIV", "LI", "TD", "TH", "BLOCKQUOTE", "PRE"]
                  , n = t.parentElement;
                for (; n && !r.includes(n.tagName); )
                    n = n.parentElement;
                if (!n)
                    return "";
                let i = Array.from(n.querySelectorAll(".reference-bubble"))
                  , a = i.findIndex(t => t.id === e);
                if (-1 === a)
                    return "";
                let l = a === i.length - 1
                  , s = i[a]
                  , o = a - 1;
                for (; o >= 0 && !tT(tM(n, i[o], o + 1 < a ? i[o + 1] : s)); )
                    o--;
                let c = o >= 0 ? i[o] : null
                  , d = tM(n, c, l ? null : s).trim()
                  , u = tM(n, c, s).trim();
                if (22 >= function(e) {
                    let t = e.trim();
                    return t ? t.split(/\s+/).filter(Boolean).length : 0
                }(u)) {
                    let e = a + 1;
                    for (; e < i.length && !tT(tM(n, i[e - 1], i[e])); )
                        e++;
                    let t = tM(n, s, e < i.length ? i[e] : null).trim()
                      , r = "".concat(u, " ").concat(t).trim();
                    if (tT(r))
                        return r
                }
                return d
            }(t);
            if (!a)
                return;
            let {pageText: l, textLayer: s} = await tP(n);
            if (!l || !s) {
                i(h.C.setRefHighlights({
                    sourceId: r,
                    highlights: [{
                        sourceId: r,
                        pageIndex: n,
                        areas: [{
                            pageIndex: n,
                            left: 1.5,
                            top: 1.5,
                            width: 97,
                            height: 97
                        }]
                    }]
                }));
                return
            }
            try {
                var o;
                let e = null !== (o = tR.get(t)) && void 0 !== o ? o : null;
                null == e && (e = (await p.rP.source.analyzeReferenceLines.mutate({
                    pageText: l,
                    paragraphText: a
                })).lines,
                function(e, t) {
                    if (tR.size >= 48) {
                        let e = tR.keys().next().value;
                        e && tR.delete(e)
                    }
                    tR.has(e) && tR.delete(e),
                    tR.set(e, t)
                }(t, e));
                let s = function(e, t) {
                    let r = document.querySelector('.rpv-core__inner-page[aria-label="Page '.concat(e + 1, '"]'));
                    if (!r)
                        return [];
                    let n = r.querySelector(".rpv-core__text-layer");
                    if (!n)
                        return [];
                    let i = n.getBoundingClientRect()
                      , a = i.width
                      , l = i.height
                      , s = Array.from(n.querySelectorAll('span.rpv-core__text-layer-text:not([data-text="false"]), br.rpv-core__text-layer-text'))
                      , o = new Map
                      , c = 1
                      , d = [];
                    for (let e of s)
                        "BR" === e.tagName ? d.length > 0 && (o.set(c, [...d]),
                        c++,
                        d = []) : "SPAN" === e.tagName && d.push(e);
                    d.length > 0 && o.set(c, d);
                    let u = new Set;
                    if (0 === t.length)
                        o.forEach( (e, t) => u.add(t));
                    else
                        for (let e of t)
                            if ("number" == typeof e)
                                u.add(e);
                            else
                                for (let t = e[0]; t <= e[1]; t++)
                                    u.add(t);
                    let h = Array.from(u).sort( (e, t) => e - t).filter(e => o.has(e) && o.get(e).length > 0);
                    if (0 === h.length)
                        return [];
                    let p = []
                      , f = []
                      , m = -1 / 0
                      , g = -1 / 0;
                    for (let t of h) {
                        let r = o.get(t)
                          , n = r[0].getBoundingClientRect().top - i.top
                          , s = m !== -1 / 0 && t !== m + 1
                          , c = f.length > 0 && n < g - 20;
                        (s || c) && (tI(p, f, i, a, l, e),
                        f = []),
                        f.push(...r),
                        m = t,
                        g = r[r.length - 1].getBoundingClientRect().bottom - i.top
                    }
                    return f.length > 0 && tI(p, f, i, a, l, e),
                    p
                }(n, e);
                i(h.C.setRefHighlights({
                    sourceId: r,
                    highlights: [{
                        sourceId: r,
                        pageIndex: n,
                        areas: s
                    }]
                }))
            } catch (e) {
                console.error("Error analyzing reference lines:", e)
            }
        }
        let tL = (0,
        e3.default)( () => Promise.all([r.e(5868), r.e(3370), r.e(7946), r.e(4275)]).then(r.bind(r, 4275)).then(e => e.ChatMarkdown))
          , tz = e => {
            var t;
            let {msg: r, isTyping: a, isLastMessage: s, isFirstMessage: o, chatId: c, scrollContainerHeight: d} = e
              , h = (0,
            u.j)()
              , p = (0,
            u.G)(e => e.sources.chunksAreas)
              , f = i.Wp.isEmpty(r.msg.trim())
              , m = ec()
              , {collections: g} = (0,
            u.G)(e => e.collections)
              , {chats: x} = (0,
            u.G)(e => e.chats)
              , v = (0,
            ea.useTranslations)("Page.Chat")
              , b = (0,
            i.SX)(i.fv, null == m ? void 0 : m.info.src)
              , y = (0,
            eI.al)()
              , w = (0,
            l.useMemo)( () => {
                var e;
                if ((null == m ? void 0 : m.info.src) != null && (0,
                i.SX)(i.fw, m.info.src))
                    return null == m ? void 0 : m.info.src;
                let t = (0,
                e4.A)((null !== (e = r.chunks) && void 0 !== e ? e : []).filter(e => null != e.s).map(e => e.s));
                if (1 == t.length)
                    return t[0]
            }
            , [null == m ? void 0 : m.info.src, r.chunks])
              , j = (0,
            i.SX)(i.vD, null == m ? void 0 : m.info.src)
              , k = (0,
            l.useMemo)( () => {
                var e;
                let t = null == m ? void 0 : null === (e = m.info) || void 0 === e ? void 0 : e.src;
                if (!(0,
                i.SX)(i.fv, t))
                    return ty.M;
                let r = g[t];
                return null == r ? ty.M : Object.fromEntries(i.Wp.objectKeys(r.sources).map(e => {
                    var t, r;
                    return [e, null === (r = Object.values(x).find(t => t.info.src == e)) || void 0 === r ? void 0 : null === (t = r.info) || void 0 === t ? void 0 : t.displayName]
                }
                ))
            }
            , [null == m ? void 0 : null === (t = m.info) || void 0 === t ? void 0 : t.src, x, g])
              , S = (0,
            l.useMemo)( () => tE(tk(tS(tA(tN(tC(tj(r.msg.replaceAll("\\[", "$$$$").replaceAll("\\]", "$$$$").replaceAll("\\(", "$$$$").replaceAll("\\)", "$$$$"))))), a)), r.type).trim(), [a, r.msg, r.type])
              , C = (0,
            l.useCallback)(async (e, t, r) => {
                if (null == c || null == e) {
                    console.error("handleGoToPage.err", c, e, t);
                    return
                }
                h(eg.b.setViewedSource({
                    chatId: c,
                    src: e,
                    pos: {
                        pageIndex: t,
                        posX: null,
                        posY: null
                    }
                })),
                h(eg.b.setViewMode({
                    chatId: c,
                    viewMode: y ? "pdf" : "split"
                })),
                tb({
                    type: "JumpToPage",
                    sourceId: e,
                    chatId: c,
                    pageIndex: t
                });
                try {
                    await t_({
                        bubbleId: r,
                        sourceId: e,
                        pageIndex: t,
                        dispatch: h
                    })
                } catch (e) {
                    console.error("Error analyzing reference lines:", e)
                }
            }
            , [c, h, y])
              , N = (0,
            l.useMemo)( () => (0,
            n.jsx)(tL, {
                txt: S,
                chunks: r.chunks,
                chunksAreas: p,
                isCollection: b,
                onGoToPage: C,
                onSendMessage: e.onSendMessage,
                singleSourceId: w,
                titleBySourceId: k,
                translate: v
            }), [S, r.chunks, p, b, C, e.onSendMessage, w, k, v])
              , A = (0,
            l.useRef)(null)
              , E = "AI" === r.author
              , I = !E
              , M = (0,
            l.useCallback)( () => {
                let e = window.getSelection()
                  , t = document.createRange();
                t.selectNode(A.current),
                null == e || e.removeAllRanges(),
                null == e || e.addRange(t),
                eV(),
                null == e || e.removeAllRanges()
            }
            , [])
              , T = (0,
            l.useMemo)( () => !!E && null != m && !!m.info.src && "standard" !== r.type && !!o && ("greeting" === r.type || "summary" === r.type || r.msg.includes("<q>")), [E, r.type, r.msg, null == m ? void 0 : m.info.src, o])
              , P = !a && T && !j
              , R = (0,
            l.useCallback)( () => {
                h((0,
                ef.A5)({
                    event: "greeting-message-flashcards-click"
                })),
                h((0,
                em.b)({
                    chatOrSourceId: c,
                    cb: async () => {
                        var e;
                        h(eQ.W.updateAndRaise({
                            initFlashcards: {
                                input: "chat",
                                chatId: c,
                                displayName: null !== (e = null == m ? void 0 : m.info.displayName) && void 0 !== e ? e : ""
                            }
                        }))
                    }
                }))
            }
            , [c, h, null == m ? void 0 : m.info.displayName])
              , _ = (0,
            l.useCallback)( () => {
                h((0,
                ef.A5)({
                    event: "greeting-message-slides-click"
                })),
                h((0,
                em.b)({
                    chatOrSourceId: c,
                    cb: async () => {
                        h(eQ.W.updateAndRaise({
                            slideOutline: {
                                input: "chat",
                                chatId: c
                            }
                        }))
                    }
                }))
            }
            , [c, h])
              , L = (0,
            l.useMemo)( () => P ? (0,
            n.jsxs)("div", {
                className: "mt-2 flex flex-wrap gap-2 items-center",
                children: [(0,
                n.jsx)("span", {
                    children: v("CreateButtonsPrefix")
                }), (0,
                n.jsx)(eF.$, {
                    onClick: R,
                    icon: (0,
                    n.jsx)(e8.A, {}),
                    className: (0,
                    eG.cn)("whitespace-normal h-auto py-1 text-start gap-1.5 border-[#bfbfbf]", "[&_span]:whitespace-normal [&_span]:overflow-visible [&_span]:text-clip [&_span]:font-normal"),
                    children: v("ButtonFlashcards")
                }), (0,
                n.jsx)(eF.$, {
                    onClick: _,
                    icon: (0,
                    n.jsx)(e6.A, {}),
                    className: (0,
                    eG.cn)("whitespace-normal h-auto py-1 text-start gap-1.5 border-[#bfbfbf]", "[&_span]:whitespace-normal [&_span]:overflow-visible [&_span]:text-clip [&_span]:font-normal"),
                    children: v("ButtonSlides")
                })]
            }) : null, [P, v, R, _]);
            return (0,
            n.jsxs)("li", {
                className: "chat-message-container group w-full pb-2 last:pb-0 list-none",
                children: [I && d > 0 && (0,
                n.jsx)("div", {
                    className: "invisible pointer-events-none",
                    style: {
                        height: d - 8,
                        marginBottom: -(d - 8)
                    }
                }), (0,
                n.jsx)("div", {
                    className: (0,
                    eG.cn)("chat-message-content flex w-full relative z-10", E ? "justify-start" : "justify-end"),
                    children: I ? (0,
                    n.jsxs)("div", {
                        className: "flex flex-col items-end max-w-[500px]",
                        children: [(0,
                        n.jsx)("div", {
                            className: "flex overflow-hidden gap-4 rounded-lg text-text-main px-3 py-2 flex-row-reverse bg-elevation-2 [&_a]:underline",
                            ref: A,
                            children: (0,
                            n.jsxs)("div", {
                                className: "flex-1 min-w-0 leading-[1.6] text-md md:text-sm",
                                children: [f && (0,
                                n.jsx)(ed.G, {}), N]
                            })
                        }), !f && (0,
                        n.jsx)(tg, {
                            messageText: r.msg,
                            onCopy: M
                        })]
                    }) : (0,
                    n.jsxs)("div", {
                        className: "flex overflow-hidden max-w-[500px] gap-4 rounded-lg text-text-main",
                        ref: A,
                        children: [(0,
                        n.jsx)("div", {
                            children: (0,
                            n.jsx)(tx.b, {})
                        }), (0,
                        n.jsxs)("div", {
                            className: "flex-1 min-w-0 leading-[1.6] text-md md:text-sm",
                            children: [f && (0,
                            n.jsx)(ed.G, {}), N, L, !f && !a && (0,
                            n.jsx)(tf, {
                                msg: r,
                                chatId: c,
                                isLastMessage: s,
                                onCopy: M
                            })]
                        })]
                    })
                })]
            })
        }
        ;
        var tD = r(97058);
        let tF = e => {
            let {chatId: t} = e
              , r = (0,
            u.j)()
              , a = (0,
            ea.useTranslations)("Page.Chat")
              , {chats: s, isLoading: o, input: d} = (0,
            u.G)(e => e.chats)
              , {collections: h} = (0,
            u.G)(e => e.collections)
              , p = (0,
            u.G)(e => null != t ? e.chats.chatHistory[t] : void 0)
              , {analysis: f} = (0,
            u.G)(e => e.sources)
              , m = (0,
            l.useRef)(null)
              , g = (0,
            l.useRef)(null)
              , [x,v] = (0,
            l.useState)(0);
            e$(m);
            let b = (0,
            eI.al)()
              , y = (0,
            l.useMemo)( () => null != t ? s[t] : void 0, [s, t])
              , [w,j] = (0,
            l.useState)(!1)
              , [k,S] = (0,
            l.useState)(!1)
              , [C,N] = (0,
            l.useState)(!1)
              , A = (0,
            eB.rd)()
              , E = (0,
            l.useRef)(null);
            (0,
            eU.f)(E, {
                disabled: b
            }),
            (0,
            l.useEffect)( () => {
                w && j("true" === localStorage.getItem("translate"))
            }
            , [w]);
            let I = (0,
            l.useMemo)( () => {
                var e;
                return (0,
                eW.SS)(null !== (e = null == p ? void 0 : p.messages) && void 0 !== e ? e : {}).filter(e => e.msg != eh.sf)
            }
            , [p]);
            !function(e) {
                let {chatId: t, messages: r, scrollContainerRef: n} = e
                  , i = (0,
                l.useRef)(null)
                  , a = (0,
                l.useRef)(null)
                  , s = (0,
                l.useCallback)( () => {
                    var e;
                    null === (e = n.current) || void 0 === e || e.scrollTo({
                        top: n.current.scrollHeight,
                        behavior: "smooth"
                    })
                }
                , [n]);
                (0,
                l.useEffect)( () => {
                    let e = null
                      , l = null
                      , s = !1;
                    if (i.current !== t && (i.current = null),
                    i.current === t || 0 === r.length)
                        return;
                    let o = () => {
                        var l;
                        if (i.current === t)
                            return;
                        let c = null === (l = n.current) || void 0 === l ? void 0 : l.querySelector(".chat-message-container:last-child .chat-message-content");
                        c ? (c.scrollIntoView({
                            behavior: "instant",
                            block: "end"
                        }),
                        n.current && (n.current.scrollTop += 16),
                        i.current = t,
                        a.current = {
                            chatId: t,
                            count: r.length
                        }) : e = setTimeout( () => {
                            s || o()
                        }
                        , 100)
                    }
                    ;
                    return l = requestAnimationFrame(o),
                    () => {
                        s = !0,
                        e && clearTimeout(e),
                        null !== l && cancelAnimationFrame(l)
                    }
                }
                , [t, r.length, n]),
                (0,
                l.useEffect)( () => {
                    if (!a.current || a.current.chatId !== t)
                        return;
                    let e = a.current.count
                      , n = r.length;
                    if (n > e) {
                        let t = r[e];
                        (null == t ? void 0 : t.author) !== "AI" && requestAnimationFrame(s)
                    }
                    a.current = {
                        chatId: t,
                        count: n
                    }
                }
                , [t, r, s])
            }({
                chatId: t,
                messages: I,
                scrollContainerRef: g
            });
            let M = (0,
            l.useMemo)( () => {
                let e = null == y ? void 0 : y.info.src;
                if ((0,
                i.SX)(i.i3, e)) {
                    var t;
                    return (null === (t = f[e]) || void 0 === t ? void 0 : t.status) === "pending"
                }
                return !1
            }
            , [f, null == y ? void 0 : y.info.src])
              , T = (0,
            l.useMemo)( () => (0,
            i.SX)(i.fv, null == y ? void 0 : y.info.src), [y])
              , P = (0,
            l.useMemo)( () => {
                let e = null == y ? void 0 : y.info.src;
                if ((0,
                i.SX)(i.fv, e)) {
                    let t = h[e];
                    return i.Wp.isEmpty(t.sources)
                }
                return !1
            }
            , [h, null == y ? void 0 : y.info.src])
              , R = (0,
            l.useMemo)( () => (null == y ? void 0 : y.info.src) != null, [null == y ? void 0 : y.info.src]);
            (0,
            l.useLayoutEffect)( () => {
                let e = g.current;
                if (!e)
                    return;
                let t = () => {
                    let t = e.clientHeight;
                    t > 0 && v(t)
                }
                ;
                t();
                let r = new ResizeObserver(t);
                return r.observe(e),
                () => r.disconnect()
            }
            , [o, P]);
            let _ = (0,
            l.useMemo)( () => {
                if (!T || P)
                    return [];
                let e = h[null == y ? void 0 : y.info.src];
                return null == e ? [] : i.Wp.objectEntries(e.sources).map(e => {
                    let[t,r] = e;
                    return {
                        srcId: t,
                        name: r.name
                    }
                }
                )
            }
            , [h, null == y ? void 0 : y.info.src, T, P])
              , L = null != t ? d[t] : void 0
              , z = null == y || P
              , D = (0,
            c.A)(z);
            (0,
            l.useEffect)( () => {
                let e = E.current;
                e && requestAnimationFrame( () => {
                    e.style.overflow = "hidden",
                    e.style.height = "auto",
                    e.offsetHeight;
                    let t = Math.max(56, Math.min(e.scrollHeight, 128));
                    e.style.height = "".concat(t, "px"),
                    e.style.overflow = "auto"
                }
                )
            }
            , [L]);
            let F = (0,
            l.useCallback)( (e, n) => {
                D.current || null == t || i.Wp.isEmpty(e.trim()) || r((0,
                em.IN)({
                    chatId: t,
                    type: null != n ? n : "standard",
                    msg: e
                }))
            }
            , [D, t, r]);
            return (0,
            n.jsxs)("div", {
                className: (0,
                eG.cn)("flex flex-col flex-grow max-w-full h-full bg-surface", R && !b && "z-20 relative shadow-[-4px_0_6px_0_rgba(0,0,0,0.04)]", !w && "notranslate"),
                children: [T && !P && (0,
                n.jsxs)("div", {
                    className: "desktop-only flex align-center px-2 py-1 text-text-subtle justify-between text-sm border-b border-border-default",
                    children: [(0,
                    n.jsxs)("div", {
                        className: "flex items-center gap-1",
                        children: [(0,
                        n.jsx)(eP.A, {
                            className: "size-3.5 shrink-0"
                        }), (0,
                        n.jsx)("span", {
                            children: a("YoureChattingWithFolder")
                        })]
                    }), (0,
                    n.jsxs)(eO.rI, {
                        children: [(0,
                        n.jsx)(eO.ty, {
                            asChild: !0,
                            children: (0,
                            n.jsx)(eF.$, {
                                variant: "ghost",
                                className: "shrink-0 [[data-state=open]]:before:bg-state-layer-neutral-hover",
                                icon: (0,
                                n.jsx)(eR.A, {}),
                                iconPosition: "right",
                                children: (0,
                                n.jsx)("span", {
                                    children: a("ChatWithFile")
                                })
                            })
                        }), (0,
                        n.jsx)(eO.SQ, {
                            children: _.map(e => (0,
                            n.jsxs)(eO._2, {
                                onClick: () => {
                                    let t = (0,
                                    eW.xs)(s, e.srcId);
                                    t && A.push({
                                        pathname: "/c/[chat_id]",
                                        params: {
                                            chat_id: i.rP.suffix(t.info.id)
                                        }
                                    })
                                }
                                ,
                                children: [(0,
                                n.jsx)(e_.A, {}), e.name]
                            }, e.srcId))
                        })]
                    })]
                }), o && (0,
                n.jsx)("div", {
                    className: "flex justify-center items-center h-full",
                    children: (0,
                    n.jsx)(ed.G, {
                        className: "self-center"
                    })
                }), !o && P && (0,
                n.jsx)("div", {
                    className: "flex justify-center items-center h-full",
                    children: (0,
                    n.jsx)("span", {
                        className: "text-text-subtlest",
                        children: a("NoPDFs")
                    })
                }), !o && !P && (0,
                n.jsxs)("div", {
                    className: "flex flex-col flex-grow h-full overflow-hidden",
                    children: [(0,
                    n.jsx)("div", {
                        ref: g,
                        className: "flex-grow overflow-auto min-h-0 flex justify-center",
                        id: "conversation",
                        children: (0,
                        n.jsx)("div", {
                            ref: m,
                            className: "w-full max-w-[800px] px-4",
                            children: i.Wp.isEmpty(I) ? (0,
                            n.jsx)("div", {
                                className: "flex justify-center items-center h-full",
                                children: null == p || M ? (0,
                                n.jsx)(ed.G, {}) : (0,
                                n.jsx)("span", {
                                    className: "text-text-subtlest",
                                    children: a("NoMessagesYet")
                                })
                            }) : (0,
                            n.jsx)("ul", {
                                className: "w-full py-8",
                                children: I.map( (e, r) => {
                                    let i = r === I.length - 1
                                      , a = i && (null == y ? void 0 : y.isAiTyping) === !0;
                                    return (0,
                                    n.jsx)(tz, {
                                        msg: e,
                                        chatId: t,
                                        isTyping: a,
                                        isLastMessage: i,
                                        isFirstMessage: 0 === r,
                                        onSendMessage: F,
                                        scrollContainerHeight: x
                                    }, e.id)
                                }
                                )
                            })
                        })
                    }), null != t && (0,
                    n.jsx)("div", {
                        className: (0,
                        eG.cn)("flex justify-center", b ? "px-2 pb-2" : "px-4 pb-4"),
                        children: (0,
                        n.jsx)("div", {
                            className: "w-full max-w-[800px]",
                            children: (0,
                            n.jsxs)("div", {
                                className: (0,
                                eG.cn)("rounded-lg bg-elevation-1 border transition-colors overflow-hidden", C ? "border-border-primary-subtle" : "border-border-default"),
                                children: [(null == y ? void 0 : y.attachedImage) && (0,
                                n.jsxs)("div", {
                                    className: "relative m-3 mb-0 border border-border-default rounded inline-block",
                                    children: [(0,
                                    n.jsx)("img", {
                                        src: y.attachedImage.base64,
                                        style: {
                                            width: y.attachedImage.width,
                                            height: y.attachedImage.height
                                        }
                                    }), (0,
                                    n.jsx)("button", {
                                        onClick: () => r(eg.b.unsetAttachedImage({
                                            chatId: t
                                        })),
                                        className: "absolute -top-1.5 -end-1.5 bg-black text-white rounded-full p-0.5 cursor-pointer shadow-md",
                                        children: (0,
                                        n.jsx)(eL.A, {
                                            className: "size-2.5"
                                        })
                                    })]
                                }), (0,
                                n.jsx)("textarea", {
                                    ref: E,
                                    className: (0,
                                    eG.cn)("w-full resize-none bg-transparent border-none outline-none text-sm rounded-t-lg", "placeholder:text-text-subtlest text-md md:text-sm", "px-2 py-2", "color-text-main"),
                                    placeholder: a("AskAnyQuestion"),
                                    value: null != L ? L : "",
                                    onChange: e => r(eg.b.setInput({
                                        chatId: t,
                                        type: "set",
                                        msg: e.currentTarget.value
                                    })),
                                    maxLength: 5e3,
                                    onCompositionStart: () => S(!0),
                                    onCompositionEnd: () => S(!1),
                                    onFocus: () => N(!0),
                                    onBlur: () => N(!1),
                                    onKeyDown: e => {
                                        "Enter" !== e.key || e.metaKey || e.altKey || e.shiftKey || k || (e.preventDefault(),
                                        z || F(null != L ? L : ""))
                                    }
                                    ,
                                    autoFocus: !b
                                }, (null == y ? void 0 : y.attachedImage) ? "with-image" : "without-image"), (0,
                                n.jsxs)("div", {
                                    className: "flex items-end gap-2 px-2 pb-2 min-w-0",
                                    children: [(0,
                                    n.jsx)("div", {
                                        className: "flex shrink min-w-0",
                                        children: (0,
                                        n.jsx)(tD.B, {})
                                    }), y && !T && (0,
                                    n.jsx)(e5, {
                                        chatId: t,
                                        currChat: y
                                    }), (0,
                                    n.jsx)(e0, {
                                        chatId: t,
                                        onAfterSelectPrompt: () => {
                                            var e;
                                            return null === (e = E.current) || void 0 === e ? void 0 : e.focus()
                                        }
                                        ,
                                        children: e => {
                                            let {isOpen: t} = e;
                                            return (0,
                                            n.jsx)(eH.F, {
                                                size: "sm",
                                                className: (0,
                                                eG.cn)("border border-border-default", t && "before:bg-state-layer-neutral-hover"),
                                                title: a("PromptLibrary"),
                                                children: t ? (0,
                                                n.jsx)(eL.A, {
                                                    className: "text-text-subtle"
                                                }) : (0,
                                                n.jsx)(ez.A, {
                                                    className: "text-text-subtle"
                                                })
                                            })
                                        }
                                    }), (0,
                                    n.jsx)(eH.F, {
                                        onClick: () => F(null != L ? L : ""),
                                        className: (0,
                                        eG.cn)("ms-auto shrink-0 border", L && L.trim().length > 0 ? "bg-primary-default text-text-inverse hover:text-text-inverse border-border-primary" : "bg-surface border-border-default"),
                                        children: (0,
                                        n.jsx)(eD.A, {})
                                    })]
                                })]
                            })
                        })
                    })]
                })]
            }, t)
        }
        ;
        r(63040),
        r(63140);
        var tO = r(11157)
          , tH = r(18700);
        r(21348);
        var tB = r(98272)
          , tW = r(55010)
          , tV = r(13345)
          , t$ = r(41858)
          , tG = r(45622);
        let tU = (e, t) => {
            let r = (0,
            u.j)();
            (0,
            l.useLayoutEffect)( () => () => {
                if (!t)
                    return;
                let n = document.querySelector(".rpv-core__inner-pages");
                n && r(eg.b.setViewedSource({
                    chatId: e,
                    src: t,
                    pos: {
                        posX: n.scrollLeft,
                        posY: n.scrollTop
                    }
                }))
            }
            , [e, t, r])
        }
        ;
        var tq = r(24248)
          , tX = r(48417);
        let tY = e => {
            let {chatId: t} = e
              , r = (0,
            u.j)()
              , n = (0,
            p.Lg)()
              , a = (0,
            u.G)(e => null != t ? e.chats.chats[t] : void 0)
              , s = (0,
            c.A)((0,
            u.G)(e => e.sources.chunksAreasQueryStatus))
              , o = (0,
            u.G)(e => null != t ? e.chats.chatHistory[t] : void 0)
              , d = (0,
            u.G)(e => e.collections.collections)
              , f = (0,
            l.useMemo)( () => {
                let e = null == a ? void 0 : a.info.src;
                return (0,
                i.SX)(i.fw, e) ? [e] : (0,
                i.SX)(i.fv, e) ? i.Wp.objectKeys(d[e].sources) : []
            }
            , [null == a ? void 0 : a.info.src, d])
              , m = (0,
            u.G)(e => e.sources.chunksAreas)
              , g = (0,
            l.useMemo)( () => {
                var e;
                return null !== (e = (0,
                tX.A)(m, f)) && void 0 !== e ? e : ty.M
            }
            , [m, f])
              , x = (0,
            c.A)(g);
            return (0,
            l.useEffect)( () => {
                if (null == o)
                    return;
                let e = new Set;
                for (let r of Object.values(o.messages))
                    if (null != r.chunks)
                        for (let n of r.chunks) {
                            var t, l, c, d;
                            let r = null !== (c = n.s) && void 0 !== c ? c : null == a ? void 0 : a.info.src;
                            if (null != r && (0,
                            i.SX)(i.fw, r) && (null == r || (null === (l = x.current) || void 0 === l ? void 0 : null === (t = l[r]) || void 0 === t ? void 0 : t[n.i]) == null) && (null === (d = s.current) || void 0 === d ? void 0 : d[r]) == null) {
                                e.add(r);
                                continue
                            }
                        }
                if (!i.Wp.notEmpty(e))
                    return;
                let u = Array.from(e)
                  , p = {};
                u.forEach(e => {
                    var t;
                    null !== (t = p[e]) && void 0 !== t || (p[e] = []),
                    r(h.C.setChunkAreasQueryStatus({
                        source: e,
                        status: "loading"
                    }))
                }
                ),
                n.current.source.getChunkAreas.query({
                    sourceChunks: p
                }).then(e => {
                    i.Wp.objectEntries(e.areas).forEach(e => {
                        let[t,n] = e;
                        r(h.C.setChunkAreasQueryStatus({
                            source: t,
                            status: "success"
                        })),
                        r(h.C.upsertChunkAreas({
                            areas: n.map( (e, r) => ({
                                ...e,
                                chunk: r,
                                sourceId: t
                            }))
                        }))
                    }
                    )
                }
                ).catch(e => {
                    console.error(e),
                    u.forEach(e => {
                        var t;
                        null !== (t = p[e]) && void 0 !== t || (p[e] = []),
                        r(h.C.setChunkAreasQueryStatus({
                            source: e,
                            status: "error"
                        }))
                    }
                    )
                }
                )
            }
            , [o, null == a ? void 0 : a.info.src, x, s, n, r, f]),
            g
        }
          , tZ = e => (0,
        n.jsxs)(n.Fragment, {
            children: [e.canvasLayer.children, e.textLayer.children, e.annotationLayer.children]
        });
        r(53134),
        r(56915);
        var tK = r(21113)
          , tQ = r(66146)
          , tJ = r(60315);
        let t0 = e => {
            let[t,r] = (0,
            l.useState)("")
              , [i,a] = (0,
            l.useState)(!1)
              , s = (0,
            l.useRef)(void 0)
              , o = (0,
            l.useRef)(null)
              , c = (0,
            ea.useTranslations)("PDFViewer")
              , d = (0,
            tJ.jH)()
              , u = (0,
            eI.al)();
            (0,
            l.useEffect)( () => (s.current = setTimeout( () => t.length > 2 ? e.setKeyword(t) : e.clearKeyword(), 300),
            () => clearTimeout(s.current)), [t]),
            (0,
            l.useEffect)( () => {
                e.keyword && e.search()
            }
            , [e.keyword]),
            (0,
            l.useEffect)( () => {
                let e = e => {
                    "Escape" === e.key && i && a(!1)
                }
                ;
                return i && document.addEventListener("keydown", e),
                () => {
                    document.removeEventListener("keydown", e)
                }
            }
            , [i]);
            let h = (0,
            l.useCallback)(t => {
                if (e.numberOfMatches <= 1)
                    return;
                let r = (e.currentMatch - 1 + e.numberOfMatches + t) % e.numberOfMatches + 1;
                e.jumpToMatch(r)
            }
            , [e])
              , p = (0,
            l.useMemo)( () => (0,
            n.jsxs)("div", {
                className: (0,
                eG.cn)("flex items-center bg-background select-none h-full pl-2 pr-1", u ? "w-[80vw]" : "w-[300px]"),
                children: [(0,
                n.jsx)(eX.A, {
                    size: 16,
                    className: "text-text-main shrink-0 mr-2"
                }), (0,
                n.jsx)("input", {
                    autoCorrect: "off",
                    ref: o,
                    placeholder: c("Search"),
                    className: "flex-1 min-w-0 bg-transparent text-sm outline-none text-text-main placeholder:text-text-subtlest",
                    value: t,
                    onChange: e => r(e.target.value),
                    onKeyDown: t => {
                        "" !== e.keyword && "Enter" === t.key && (clearTimeout(s.current),
                        h(t.shiftKey ? -1 : 1))
                    }
                }), (0,
                n.jsxs)("div", {
                    className: "flex items-center text-sm shrink-0",
                    children: [(0,
                    n.jsx)(eu.FicoTooltip, {
                        title: c("PreviousMatch"),
                        children: (0,
                        n.jsx)(eH.F, {
                            variant: "ghost",
                            onClick: () => h(-1),
                            children: (0,
                            n.jsx)(tK.A, {
                                size: 16
                            })
                        })
                    }), (0,
                    n.jsxs)("span", {
                        className: "min-w-[32px] text-center tabular-nums text-text-subtle whitespace-nowrap",
                        children: [e.currentMatch, "/", e.numberOfMatches]
                    }), (0,
                    n.jsx)(eu.FicoTooltip, {
                        title: c("NextMatch"),
                        children: (0,
                        n.jsx)(eH.F, {
                            variant: "ghost",
                            onClick: () => h(1),
                            children: (0,
                            n.jsx)(tQ.A, {
                                size: 16
                            })
                        })
                    })]
                })]
            }), [h, e.currentMatch, e.keyword, e.numberOfMatches, c, t, u]);
            return (0,
            n.jsxs)(eK.AM, {
                open: i,
                onOpenChange: t => {
                    a(t),
                    t ? setTimeout( () => {
                        var e, t;
                        null === (e = o.current) || void 0 === e || e.focus(),
                        null === (t = o.current) || void 0 === t || t.select()
                    }
                    , 0) : (r(""),
                    e.clearKeyword())
                }
                ,
                children: [(0,
                n.jsx)(eK.Wv, {
                    asChild: !0,
                    children: (0,
                    n.jsx)("div", {
                        className: "flex-shrink-0",
                        children: (0,
                        n.jsx)(eu.FicoTooltip, {
                            title: c("Search"),
                            placement: "top",
                            children: (0,
                            n.jsx)(eH.F, {
                                className: (0,
                                eG.cn)(i && "bg-state-layer-neutral-pressed"),
                                children: i ? (0,
                                n.jsx)(eL.A, {
                                    className: "text-text-subtle"
                                }) : (0,
                                n.jsx)(eX.A, {
                                    className: "text-text-subtle"
                                })
                            })
                        })
                    })
                }), (0,
                n.jsx)(eK.hl, {
                    side: u ? "top" : "ltr" === d ? "right" : "left",
                    sideOffset: u ? 4 : 8,
                    showArrow: !1,
                    className: (0,
                    eG.cn)("p-0 w-auto h-10 border border-border-primary-subtle", u && "max-w-[95vw]"),
                    children: p
                })]
            })
        }
        ;
        var t1 = r(43305);
        let t2 = () => {
            var e;
            let t = (0,
            u.j)()
              , r = (0,
            p.Lg)()
              , [n,a] = (0,
            l.useState)()
              , s = ec()
              , o = (0,
            l.useMemo)( () => {
                if ((null == s ? void 0 : s.sourceInViewer) != null)
                    return s.sourceInViewer;
                let e = null == s ? void 0 : s.info.src;
                if ((0,
                i.SX)(i.fw, e))
                    return e
            }
            , [s])
              , c = (0,
            u.G)(e => null == o ? void 0 : e.sources.signedUrlStates[o]);
            return (0,
            l.useEffect)( () => {
                null == o || null != c && c.isLoading || (async () => {
                    let e = await t1.I.get(o);
                    if (e) {
                        if ((null == n ? void 0 : n.sourceId) === o && "blob" === n.type || (a({
                            type: "blob",
                            data: e,
                            sourceId: o
                        }),
                        (null == n ? void 0 : n.sourceId) === o && "blob" === n.type))
                            return;
                        a({
                            type: "blob",
                            data: e,
                            sourceId: o
                        });
                        return
                    }
                    if (!((null == s ? void 0 : s.info.isPending) || (null == c ? void 0 : c.url) && c.expires > Date.now() / 1e3)) {
                        t(h.C.setSignedUrl({
                            sourceId: o,
                            state: {
                                isLoading: !0,
                                url: void 0,
                                expires: 0,
                                isError: !1
                            }
                        }));
                        try {
                            let e = await r.current.source.getSignedUrl.mutate({
                                source: o
                            });
                            try {
                                let t = await fetch(e.url)
                                  , r = await t.arrayBuffer()
                                  , n = new Uint8Array(r);
                                await t1.I.set(o, n),
                                a({
                                    type: "blob",
                                    data: n,
                                    sourceId: o
                                })
                            } catch (t) {
                                console.error("Failed to cache PDF:", t),
                                a({
                                    type: "url",
                                    data: e.url,
                                    sourceId: o
                                })
                            }
                            let n = {
                                isLoading: !1,
                                url: e.url,
                                expires: e.expires,
                                isError: !1
                            };
                            t(h.C.setSignedUrl({
                                sourceId: o,
                                state: n
                            }))
                        } catch (e) {
                            console.error("Failed to get signed URL:", e),
                            t(h.C.setSignedUrl({
                                sourceId: o,
                                state: {
                                    isLoading: !1,
                                    url: void 0,
                                    expires: 0,
                                    isError: !0
                                }
                            }))
                        }
                    }
                }
                )()
            }
            , [r, o, t, c, null == s ? void 0 : null === (e = s.info) || void 0 === e ? void 0 : e.isPending, n]),
            (0,
            l.useMemo)( () => {
                var e, t;
                let r;
                let i = null !== (e = null == c ? void 0 : c.isError) && void 0 !== e && e
                  , a = null !== (t = null == c ? void 0 : c.isLoading) && void 0 !== t && t;
                return n && n.sourceId === o ? r = n : (null == c ? void 0 : c.url) && (r = {
                    type: "url",
                    data: c.url,
                    sourceId: null != o ? o : ""
                }),
                {
                    pdfData: r,
                    sourceId: o,
                    isError: i,
                    isLoading: a
                }
            }
            , [n, o, c])
        }
          , t5 = () => {
            let e = (0,
            l.useMemo)( () => (0,
            b.createStore)(), []);
            return (0,
            l.useMemo)( () => ({
                install: t => {
                    e.update("jumpToPage", t.jumpToPage)
                }
                ,
                jumpToPage: t => {
                    let r = e.get("jumpToPage");
                    r && r(t)
                }
            }), [e])
        }
          , t4 = e => {
            let {startCoord: t} = e
              , {isFinished: r} = (0,
            u.G)(e => e.ui.visionSelect)
              , [i,a] = (0,
            l.useState)(!1)
              , [s,o] = (0,
            l.useState)(!1)
              , [c,d] = (0,
            l.useState)(!1)
              , [h,p] = (0,
            l.useState)(null)
              , [f,m] = (0,
            l.useState)({
                x: 0,
                y: 0,
                width: 0,
                height: 0
            })
              , g = (0,
            l.useRef)(null)
              , x = (0,
            l.useRef)({
                x: 0,
                y: 0
            })
              , v = (0,
            l.useRef)({
                x: 0,
                y: 0,
                areaX: 0,
                areaY: 0
            })
              , b = (0,
            l.useRef)({
                x: 0,
                y: 0,
                area: {
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0
                }
            })
              , y = (0,
            u.j)();
            (0,
            l.useEffect)( () => (setTimeout( () => {
                Z() || y(ex.e5.resetVisionSelect())
            }
            , 0),
            x.current = {
                x: t.x,
                y: t.y
            },
            m({
                x: t.x,
                y: t.y,
                width: 0,
                height: 0
            }),
            a(!0),
            document.body.style.userSelect = "none",
            () => {
                document.body.style.userSelect = "auto"
            }
            ), [t, y]),
            (0,
            l.useEffect)( () => {
                if (!r)
                    return;
                let e = document.createElement("div");
                e.id = "vision-select-overlay",
                e.style.position = "fixed",
                e.style.top = "0",
                e.style.left = "0",
                e.style.width = "100vw",
                e.style.height = "100vh",
                e.style.zIndex = "999",
                e.style.cursor = "default",
                e.style.backgroundColor = "transparent";
                let t = e => {
                    let t = document.getElementById("vision-select-rect");
                    t && !t.contains(e.target) && y(ex.e5.resetVisionSelect())
                }
                ;
                return e.addEventListener("mousedown", t),
                document.body.appendChild(e),
                () => {
                    e.removeEventListener("mousedown", t),
                    document.body.contains(e) && document.body.removeChild(e)
                }
            }
            , [r, y]);
            let w = (0,
            l.useCallback)(e => {
                if (!g.current)
                    return;
                let t = g.current.getBoundingClientRect()
                  , r = e.clientX - t.left
                  , n = Math.max(e.clientY - t.top, 0);
                if (i) {
                    let e = Math.round(Math.min(r, x.current.x));
                    m({
                        x: e,
                        y: Math.round(Math.min(n, x.current.y)),
                        width: Math.round(Math.abs(r - x.current.x)),
                        height: Math.round(Math.abs(n - x.current.y))
                    })
                }
                if (s) {
                    let e = r - v.current.x
                      , i = n - v.current.y
                      , a = Math.max(0, v.current.areaX + e)
                      , l = Math.max(0, v.current.areaY + i)
                      , s = t.width - f.width
                      , o = t.height - f.height;
                    m(e => ({
                        ...e,
                        x: Math.min(a, s),
                        y: Math.min(l, o)
                    }))
                }
                if (c && h) {
                    let e = b.current.area
                      , t = r - b.current.x
                      , i = n - b.current.y
                      , a = {
                        ...e
                    };
                    switch (h) {
                    case "top":
                        a.y = Math.min(e.y + i, e.y + e.height - 24),
                        a.height = e.height - (a.y - e.y);
                        break;
                    case "right":
                        a.width = Math.max(24, e.width + t);
                        break;
                    case "bottom":
                        a.height = Math.max(24, e.height + i);
                        break;
                    case "left":
                        a.x = Math.min(e.x + t, e.x + e.width - 24),
                        a.width = e.width - (a.x - e.x);
                        break;
                    case "topLeft":
                        a.x = Math.min(e.x + t, e.x + e.width - 24),
                        a.y = Math.min(e.y + i, e.y + e.height - 24),
                        a.width = e.width - (a.x - e.x),
                        a.height = e.height - (a.y - e.y);
                        break;
                    case "topRight":
                        a.y = Math.min(e.y + i, e.y + e.height - 24),
                        a.width = Math.max(24, e.width + t),
                        a.height = e.height - (a.y - e.y);
                        break;
                    case "bottomLeft":
                        a.x = Math.min(e.x + t, e.x + e.width - 24),
                        a.width = e.width - (a.x - e.x),
                        a.height = Math.max(24, e.height + i);
                        break;
                    case "bottomRight":
                        a.width = Math.max(24, e.width + t),
                        a.height = Math.max(24, e.height + i)
                    }
                    a.width = Math.max(24, a.width),
                    a.height = Math.max(24, a.height),
                    m(a)
                }
            }
            , [f.height, f.width, i, s, c, h])
              , j = (0,
            l.useCallback)(async () => {
                if (g.current) {
                    if (a(!1),
                    o(!1),
                    d(!1),
                    p(null),
                    f.width < 24 && f.height < 24) {
                        y(ex.e5.resetVisionSelect());
                        return
                    }
                    y(ex.e5.setVisionSelectArea(f)),
                    r || y(ex.e5.setVisionSelectFinished(!0))
                }
            }
            , [f, y, r]);
            (0,
            l.useEffect)( () => {
                let e = e => {
                    "Escape" === e.key && y(ex.e5.resetVisionSelect())
                }
                ;
                return document.addEventListener("keydown", e),
                () => {
                    document.removeEventListener("keydown", e)
                }
            }
            , [y]),
            (0,
            l.useEffect)( () => (i || s || c ? (document.onmousemove = w,
            document.onmouseup = j) : (document.onmousemove = null,
            document.onmouseup = null),
            () => {
                document.onmousemove = null,
                document.onmouseup = null
            }
            ), [i, s, c, w, j]);
            let k = (0,
            l.useCallback)(e => {
                if (!g.current)
                    return;
                if (r) {
                    let t = document.getElementById("vision-select-rect");
                    t && !t.contains(e.target) && y(ex.e5.resetVisionSelect());
                    return
                }
                document.body.style.userSelect = "none";
                let t = g.current.getBoundingClientRect();
                x.current = {
                    x: e.clientX - t.left,
                    y: e.clientY - t.top
                },
                m({
                    x: e.clientX - t.left,
                    y: e.clientY - t.top,
                    width: 0,
                    height: 0
                }),
                a(!0)
            }
            , [r, y])
              , S = (0,
            l.useCallback)(e => {
                if (!g.current || !r)
                    return;
                e.stopPropagation(),
                document.body.style.userSelect = "none";
                let t = g.current.getBoundingClientRect();
                v.current = {
                    x: e.clientX - t.left,
                    y: e.clientY - t.top,
                    areaX: f.x,
                    areaY: f.y
                },
                o(!0)
            }
            , [r, f.x, f.y])
              , C = (0,
            l.useCallback)( (e, t) => {
                if (!g.current || !r)
                    return;
                e.stopPropagation(),
                document.body.style.userSelect = "none";
                let n = g.current.getBoundingClientRect();
                b.current = {
                    x: e.clientX - n.left,
                    y: e.clientY - n.top,
                    area: {
                        ...f
                    }
                },
                p(t),
                d(!0)
            }
            , [r, f]);
            return (0,
            l.useMemo)( () => {
                let e = {
                    position: "absolute",
                    backgroundColor: "rgba(0, 0, 0, 0.35)",
                    pointerEvents: r ? "none" : "auto"
                }
                  , t = {
                    ...e,
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: "".concat(f.x, "px")
                }
                  , a = {
                    ...e,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: "calc(100% - ".concat(f.x + f.width, "px)")
                }
                  , l = {
                    ...e,
                    top: 0,
                    left: "".concat(f.x, "px"),
                    right: "calc(100% - ".concat(f.x + f.width, "px)"),
                    height: "".concat(f.y, "px")
                }
                  , s = {
                    ...e,
                    bottom: 0,
                    left: "".concat(f.x, "px"),
                    right: "calc(100% - ".concat(f.x + f.width, "px)"),
                    height: "calc(100% - ".concat(f.y + f.height, "px)")
                }
                  , o = {
                    position: "absolute",
                    width: "".concat(8, "px"),
                    height: "".concat(8, "px"),
                    backgroundColor: "#ffffff",
                    border: "1px solid #666",
                    borderRadius: "50%",
                    zIndex: 1002,
                    display: r ? "block" : "none"
                }
                  , c = {
                    ...o,
                    top: "-".concat(4, "px"),
                    left: "calc(50% - ".concat(4, "px)"),
                    cursor: "ns-resize"
                }
                  , d = {
                    ...o,
                    top: "calc(50% - ".concat(4, "px)"),
                    right: "-".concat(4, "px"),
                    cursor: "ew-resize"
                }
                  , u = {
                    ...o,
                    bottom: "-".concat(4, "px"),
                    left: "calc(50% - ".concat(4, "px)"),
                    cursor: "ns-resize"
                }
                  , h = {
                    ...o,
                    top: "calc(50% - ".concat(4, "px)"),
                    left: "-".concat(4, "px"),
                    cursor: "ew-resize"
                }
                  , p = {
                    ...o,
                    top: "-".concat(4, "px"),
                    left: "-".concat(4, "px"),
                    cursor: "nwse-resize"
                }
                  , m = {
                    ...o,
                    top: "-".concat(4, "px"),
                    right: "-".concat(4, "px"),
                    cursor: "nesw-resize"
                }
                  , x = {
                    ...o,
                    bottom: "-".concat(4, "px"),
                    left: "-".concat(4, "px"),
                    cursor: "nesw-resize"
                }
                  , v = {
                    ...o,
                    bottom: "-".concat(4, "px"),
                    right: "-".concat(4, "px"),
                    cursor: "nwse-resize"
                };
                return (0,
                n.jsx)("div", {
                    style: {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 1e3,
                        cursor: r ? "default" : "crosshair",
                        pointerEvents: "auto",
                        boxSizing: "border-box"
                    },
                    children: (0,
                    n.jsx)("div", {
                        ref: g,
                        onMouseDown: k,
                        style: {
                            position: "relative",
                            width: "100%",
                            height: "100%"
                        },
                        children: (i || r) && (f.width > 0 || f.height > 0) && (0,
                        n.jsxs)(n.Fragment, {
                            children: [(0,
                            n.jsx)("div", {
                                className: "vision-select-mask",
                                style: {
                                    ...e,
                                    ...l
                                }
                            }), (0,
                            n.jsx)("div", {
                                className: "vision-select-mask",
                                style: {
                                    ...e,
                                    ...s
                                }
                            }), (0,
                            n.jsx)("div", {
                                className: "vision-select-mask",
                                style: {
                                    ...e,
                                    ...t
                                }
                            }), (0,
                            n.jsx)("div", {
                                className: "vision-select-mask",
                                style: {
                                    ...e,
                                    ...a
                                }
                            }), (0,
                            n.jsx)("div", {
                                id: "vision-select-rect",
                                className: "rotating-border",
                                onMouseDown: r ? S : void 0,
                                style: {
                                    position: "absolute",
                                    top: "".concat(f.y, "px"),
                                    left: "".concat(f.x, "px"),
                                    width: "".concat(f.width, "px"),
                                    height: "".concat(f.height, "px"),
                                    boxSizing: "border-box",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: r ? "auto" : "none",
                                    cursor: r ? "move" : "default",
                                    zIndex: 1001
                                },
                                children: r && (0,
                                n.jsxs)(n.Fragment, {
                                    children: [(0,
                                    n.jsx)("div", {
                                        style: c,
                                        onMouseDown: e => C(e, "top")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: d,
                                        onMouseDown: e => C(e, "right")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: u,
                                        onMouseDown: e => C(e, "bottom")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: h,
                                        onMouseDown: e => C(e, "left")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: p,
                                        onMouseDown: e => C(e, "topLeft")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: m,
                                        onMouseDown: e => C(e, "topRight")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: x,
                                        onMouseDown: e => C(e, "bottomLeft")
                                    }), (0,
                                    n.jsx)("div", {
                                        style: v,
                                        onMouseDown: e => C(e, "bottomRight")
                                    })]
                                })
                            })]
                        })
                    })
                })
            }
            , [f.height, f.width, f.x, f.y, k, S, C, i, r])
        }
          , t8 = e => {
            var t, r;
            let {chatId: a} = e
              , s = (0,
            u.j)()
              , o = (0,
            ea.useTranslations)("PDFViewer")
              , {pdfData: d, sourceId: h, isError: p} = t2()
              , f = ec()
              , {collections: m} = (0,
            u.G)(e => e.collections)
              , {chats: g, scrollPos: x} = (0,
            u.G)(e => e.chats)
              , [v,y] = (0,
            l.useState)({
                x: 0,
                y: 0
            })
              , {visionSelect: w} = (0,
            u.G)(e => e.ui)
              , j = (0,
            i.SX)(i.fv, null == f ? void 0 : f.info.src)
              , k = (0,
            eI.al)();
            (0,
            l.useLayoutEffect)( () => {
                if ((0,
                eI.CN)())
                    return;
                let e = !1
                  , t = document.querySelector(".pdf-viewer");
                t && (t.addEventListener("mousedown", () => {
                    e = !0
                }
                ),
                document.addEventListener("mouseup", () => {
                    setTimeout( () => {
                        e = !1
                    }
                    , 0)
                }
                ));
                let r = new MutationObserver(t => {
                    t.forEach(t => {
                        t.addedNodes.forEach(t => {
                            t instanceof HTMLElement && t.classList.contains("rpv-core__text-layer") && (t.style.cursor = "crosshair",
                            t.addEventListener("mousedown", e => {
                                if (e.target === t) {
                                    setTimeout( () => {
                                        var e;
                                        return null === (e = window.getSelection()) || void 0 === e ? void 0 : e.removeAllRanges()
                                    }
                                    , 0);
                                    let t = document.querySelector(".rpv-core__viewer");
                                    if (!t)
                                        return;
                                    let r = t.getBoundingClientRect();
                                    y({
                                        x: e.clientX - r.left,
                                        y: e.clientY - r.top
                                    }),
                                    s(ex.e5.setVisionSelectActive(!0))
                                }
                            }
                            ),
                            t.addEventListener("mouseup", t => {
                                e || (t.preventDefault(),
                                t.stopPropagation())
                            }
                            ))
                        }
                        )
                    }
                    )
                }
                );
                return t && r.observe(t, {
                    childList: !0,
                    subtree: !0
                }),
                () => {
                    r.disconnect();
                    let t = document.querySelector(".pdf-viewer");
                    t && t.removeEventListener("mousedown", () => {
                        e = !0
                    }
                    ),
                    document.removeEventListener("mouseup", () => {
                        e = !1
                    }
                    )
                }
            }
            , [s]);
            let S = g[a];
            tY({
                chatId: a
            });
            let C = (0,
            tB.zoomPlugin)()
              , N = (0,
            c.A)(C)
              , A = (0,
            tO.pageNavigationPlugin)()
              , E = (0,
            c.A)(A)
              , I = t5()
              , {jumpToPage: M} = I
              , T = (0,
            tH.searchPlugin)()
              , P = (0,
            c.A)(T)
              , R = X({
                sourceId: null == f ? void 0 : f.sourceInViewer
            })
              , _ = (0,
            l.useMemo)( () => ({
                transformSize: e => {
                    let {size: t} = e;
                    return {
                        height: t.height + 8,
                        width: t.width + 8
                    }
                }
                ,
                buildPageStyles: () => ({
                    backgroundColor: "var(--color-elevation-2)"
                })
            }), [])
              , L = (0,
            l.useMemo)( () => {
                if (!j)
                    return [];
                let e = m[f.info.src];
                return null == e ? [] : i.Wp.objectEntries(e.sources).map(e => {
                    let[t,r] = e;
                    return {
                        srcId: t,
                        name: r.name
                    }
                }
                )
            }
            , [f, m, j])
              , z = (0,
            l.useMemo)( () => {
                if (!j)
                    return "";
                let e = m[f.info.src];
                if (null == e)
                    return "";
                let t = e.sources[f.sourceInViewer];
                return null == t ? "" : t.name
            }
            , [f, m, j]);
            (0,
            l.useEffect)( () => {
                let e = tv.subscribe(e => {
                    "JumpToPage" == e.type && M(e.pageIndex)
                }
                );
                return () => e.unsubscribe()
            }
            , [s, M]),
            tU(a, h);
            let D = (0,
            c.A)((null == S ? void 0 : S.sourceInViewer) != null ? null === (t = x[a]) || void 0 === t ? void 0 : t[S.sourceInViewer] : null)
              , F = (0,
            l.useRef)(!(null === (r = D.current) || void 0 === r ? void 0 : r.zoom))
              , O = (0,
            l.useRef)(!1)
              , H = (0,
            l.useCallback)( (e, t) => {
                let r = D.current;
                if (null != r) {
                    if (null != r.posX || null != r.posY) {
                        var n, i;
                        let e = null !== (n = r.posX) && void 0 !== n ? n : 0
                          , t = null !== (i = r.posY) && void 0 !== i ? i : 0;
                        (0,
                        tq.H)(".rpv-core__inner-pages", e, t, {
                            maxAttempts: 50
                        })
                    } else
                        void 0 !== r.pageIndex && M(r.pageIndex)
                }
                F.current && setTimeout( () => {
                    N.current.zoomTo(2),
                    setTimeout( () => {
                        O.current || N.current.zoomTo(b.SpecialZoomLevel.PageWidth)
                    }
                    , 40)
                }
                , 50)
            }
            , [M, D, N])
              , B = (0,
            l.useCallback)( () => {
                F.current = !0,
                N.current.zoomTo(b.SpecialZoomLevel.PageWidth)
            }
            , [N]);
            (0,
            l.useEffect)( () => {
                let e;
                let t = null
                  , r = setTimeout( () => {
                    let r = document.querySelector(".pdf-viewer");
                    r && (t = new ResizeObserver( () => {
                        clearTimeout(e),
                        e = setTimeout( () => {
                            F.current && !O.current && N.current.zoomTo(b.SpecialZoomLevel.PageWidth)
                        }
                        , 100)
                    }
                    )).observe(r)
                }
                , 1e3);
                return () => {
                    clearTimeout(r),
                    clearTimeout(e),
                    null == t || t.disconnect()
                }
            }
            , [N]);
            let W = (0,
            l.useCallback)(e => {
                F.current = !1,
                e()
            }
            , [])
              , V = (0,
            l.useCallback)(e => {
                F.current = !1,
                e()
            }
            , [])
              , $ = (0,
            l.useCallback)( () => {
                var e;
                if (!((null == d ? void 0 : d.data)instanceof Uint8Array))
                    return;
                let t = new Blob([new Uint8Array(d.data)],{
                    type: "application/pdf"
                })
                  , r = URL.createObjectURL(t)
                  , n = (null == f ? void 0 : null === (e = f.info.displayName) || void 0 === e ? void 0 : e.trim()) || "document.pdf";
                n.toLowerCase().endsWith(".pdf") || (n += ".pdf");
                let i = document.createElement("a");
                i.href = r,
                i.download = n,
                document.body.appendChild(i),
                i.click(),
                document.body.removeChild(i),
                URL.revokeObjectURL(r)
            }
            , [null == d ? void 0 : d.data, null == f ? void 0 : f.info.displayName])
              , G = (0,
            l.useMemo)( () => {
                let {ZoomIn: e, ZoomOut: t} = N.current
                  , {CurrentPageLabel: r, CurrentPageInput: i} = E.current
                  , {Search: l} = P.current;
                return (0,
                n.jsx)("div", {
                    className: (0,
                    eG.cn)("toolbar absolute flex z-10", k ? "left-0 right-0 bottom-0 justify-stretch" : "left-3 right-3 bottom-4 justify-center"),
                    children: (0,
                    n.jsxs)("div", {
                        className: (0,
                        eG.cn)("flex items-center p-1", "border border-border-default", "bg-[rgba(249,249,251,0.90)]", "pointer-events-auto", "text-text-subtle", "text-sm", "truncate", k ? "flex-1 justify-center rounded-none shadow-[0_0_24px_0_rgba(0,0,0,0.2)] backdrop-blur-[6px]" : "rounded-lg max-w-[calc(100%_-_8px)] shadow-[0_4px_12px_rgba(0,0,0,0.20)] backdrop-blur-[6px]"),
                        children: [j && (0,
                        n.jsxs)(n.Fragment, {
                            children: [(0,
                            n.jsxs)(eO.rI, {
                                children: [(0,
                                n.jsx)(eO.ty, {
                                    asChild: !0,
                                    children: (0,
                                    n.jsx)(eF.$, {
                                        variant: "ghost",
                                        className: "text-text-subtle max-w-72 truncate font-normal [[data-state=open]]:before:bg-state-layer-neutral-hover",
                                        icon: (0,
                                        n.jsx)(eR.A, {}),
                                        iconPosition: "right",
                                        children: z
                                    })
                                }), (0,
                                n.jsx)(eO.SQ, {
                                    children: L.map(e => (0,
                                    n.jsxs)(eO._2, {
                                        disabled: e.srcId === (null == f ? void 0 : f.sourceInViewer),
                                        onClick: () => {
                                            s((0,
                                            em.Fe)({
                                                sourceId: e.srcId,
                                                collectionChatId: a
                                            }))
                                        }
                                        ,
                                        children: [(0,
                                        n.jsx)(e_.A, {}), e.name]
                                    }, e.srcId))
                                })]
                            }), (0,
                            n.jsx)(t6, {})]
                        }), (0,
                        n.jsx)(t, {
                            children: e => (0,
                            n.jsx)(eu.FicoTooltip, {
                                title: o("ZoomOut"),
                                children: (0,
                                n.jsx)(eH.F, {
                                    onClick: () => V(e.onClick),
                                    children: (0,
                                    n.jsx)(tW.A, {
                                        className: "text-text-subtle"
                                    })
                                })
                            })
                        }), (0,
                        n.jsx)(eu.FicoTooltip, {
                            title: o("ResetZoom"),
                            children: (0,
                            n.jsx)(eH.F, {
                                onClick: B,
                                children: (0,
                                n.jsx)(tV.A, {
                                    className: "text-text-subtle"
                                })
                            })
                        }), (0,
                        n.jsx)(e, {
                            children: e => (0,
                            n.jsx)(eu.FicoTooltip, {
                                title: o("ZoomIn"),
                                children: (0,
                                n.jsx)(eH.F, {
                                    onClick: () => W(e.onClick),
                                    children: (0,
                                    n.jsx)(eq.A, {
                                        className: "text-text-subtle"
                                    })
                                })
                            })
                        }), (0,
                        n.jsx)(t6, {}), (0,
                        n.jsx)(r, {
                            children: e => (0,
                            n.jsxs)("div", {
                                className: "mx-2 flex flex-shrink-0 items-center text-text-subtlest gap-1",
                                children: [(0,
                                n.jsx)(i, {}), (0,
                                n.jsxs)("span", {
                                    children: [o("PageXOfY"), " "]
                                }), (0,
                                n.jsx)("span", {
                                    className: "pdf-total-pages",
                                    children: e.numberOfPages
                                })]
                            })
                        }), (0,
                        n.jsx)(t6, {}), (null == d ? void 0 : d.data)instanceof Uint8Array && (0,
                        n.jsx)(eu.FicoTooltip, {
                            title: o("DownloadPDF"),
                            children: (0,
                            n.jsx)(eH.F, {
                                onClick: $,
                                children: (0,
                                n.jsx)(t$.A, {
                                    className: "text-text-subtle"
                                })
                            })
                        }), (0,
                        n.jsx)(l, {
                            children: e => (0,
                            n.jsx)(t0, {
                                ...e
                            })
                        })]
                    })
                })
            }
            , [N, E, P, j, z, L, null == d ? void 0 : d.data, $, o, null == f ? void 0 : f.sourceInViewer, s, a, k, B, W, V])
              , U = (0,
            l.useMemo)( () => (null == d ? void 0 : d.data) == null ? null : d.data instanceof Uint8Array ? d.data.slice() : d.data, [null == d ? void 0 : d.data])
              , q = (0,
            l.useMemo)( () => {
                if (null == U)
                    return null;
                console.log("pdfData.data", U);
                try {
                    var e;
                    return (0,
                    n.jsx)(b.Viewer, {
                        defaultScale: (null === (e = D.current) || void 0 === e ? void 0 : e.zoom) ? D.current.zoom : b.SpecialZoomLevel.PageWidth,
                        fileUrl: U,
                        renderPage: e => (0,
                        n.jsx)(tZ, {
                            ...e
                        }),
                        renderLoader: () => (0,
                        n.jsx)("div", {
                            className: "flex flex-col flex-1 h-full items-center justify-center bg-elevation-2",
                            children: (0,
                            n.jsx)(ed.G, {})
                        }),
                        pageLayout: _,
                        plugins: [E.current, I, N.current, T, R],
                        transformGetDocumentParams: e => Object.assign({}, e, {
                            isEvalSupported: !1
                        }),
                        onPageChange: e => {
                            null != h && s(eg.b.setViewedSource({
                                chatId: a,
                                src: h,
                                pos: {
                                    pageIndex: e.currentPage
                                }
                            }))
                        }
                        ,
                        onZoom: e => {
                            if (F.current && e.scale > 2) {
                                O.current = !0,
                                setTimeout( () => {
                                    N.current.zoomTo(2)
                                }
                                , 0),
                                setTimeout( () => {
                                    O.current = !1
                                }
                                , 200);
                                return
                            }
                            null != h && s(eg.b.setViewedSource({
                                chatId: a,
                                src: h,
                                pos: {
                                    zoom: e.scale
                                }
                            }))
                        }
                        ,
                        onDocumentLoad: () => H(a, h)
                    })
                } catch (e) {
                    return console.error("Error rendering PDF viewer", e),
                    null
                }
            }
            , [U, D, _, E, I, N, T, R, h, s, a, H])
              , Y = (0,
            l.useMemo)( () => j && (null == f ? void 0 : f.sourceInViewer) == null ? (0,
            n.jsxs)("div", {
                className: "flex flex-1 flex-col items-center justify-center gap-2",
                children: [(0,
                n.jsx)(tG.g1V, {
                    className: "size-11 text-text-subtlest"
                }), (0,
                n.jsxs)("div", {
                    className: "text-text-subtlest",
                    children: [0 === L.length && o("EmptyFolder"), 1 === L.length && o("FollderWith1File"), L.length > 1 && o("FolderWithNFiles", {
                        limit: L.length
                    })]
                }), 0 === L.length && (0,
                n.jsxs)("div", {
                    className: "my-2 border border-border-default rounded-md p-4 text-text-subtlest",
                    children: [o("DragFiles1"), (0,
                    n.jsxs)("ul", {
                        className: "list-disc ps-4 space-y-0.5",
                        children: [(0,
                        n.jsx)("li", {
                            className: "ps-0",
                            children: o("DragFiles2")
                        }), (0,
                        n.jsx)("li", {
                            className: "ps-0",
                            children: o("DragFiles3")
                        })]
                    })]
                })]
            }) : null, [null == f ? void 0 : f.sourceInViewer, j, o, L.length]);
            return (0,
            l.useMemo)( () => {
                try {
                    return (0,
                    n.jsx)(b.Worker, {
                        workerUrl: "/_static/pdfjs-dist@3.11.174/pdf.worker.min.js",
                        children: (0,
                        n.jsxs)("div", {
                            className: "pdf-viewer flex flex-col h-full relative bg-elevation-2",
                            children: [w.isActive && (0,
                            n.jsx)(t4, {
                                startCoord: v
                            }), d && (0,
                            n.jsx)("div", {
                                className: "flex-1 overflow-hidden",
                                children: q
                            }), Y, !p && !d && !Y && (0,
                            n.jsx)("div", {
                                className: "flex flex-1 flex-col items-center justify-center bg-elevation-2",
                                children: (0,
                                n.jsx)(ed.G, {})
                            }), d && G]
                        })
                    })
                } catch (e) {
                    return console.error("Error rendering PDF worker", e),
                    null
                }
            }
            , [w.isActive, v, d, q, Y, p, G])
        }
          , t6 = () => (0,
        n.jsx)("div", {
            className: "w-px h-4 bg-border-default mx-1"
        })
          , t3 = e => {
            var t;
            let {chatId: r} = e
              , a = (0,
            u.j)()
              , {justStartedChats: d, chatHistory: f, chats: m} = (0,
            u.G)(e => e.chats)
              , g = (0,
            p.Lg)()
              , x = (0,
            u.G)(e => (0,
            eA.Rp)(e.account))
              , {ficoUserId: v} = (0,
            eM.Cx)()
              , b = (0,
            c.A)(d)
              , y = (0,
            c.A)(f)
              , w = null !== (t = (0,
            u.G)(e => {
                var t;
                return r ? null === (t = e.chats.chats[r]) || void 0 === t ? void 0 : t.viewMode : "split"
            }
            )) && void 0 !== t ? t : "split"
              , j = (0,
            l.useMemo)( () => {
                if (null == r)
                    return !1;
                let e = m[r];
                return null != e && (null == e ? void 0 : e.info.src) != null
            }
            , [m, r]);
            (0,
            l.useEffect)( () => {
                if (null != r && x) {
                    var e;
                    !b.current.includes(r) && i.Wp.isEmpty(null === (e = y.current[r]) || void 0 === e ? void 0 : e.messages) && (a(eg.b.setIsLoading(!0)),
                    g.current.chat.getV3.query({
                        chatId: r
                    }).then(e => {
                        a(eg.b.addChats({
                            [r]: e.chat
                        })),
                        a(eg.b.modifyHistory({
                            chatId: r,
                            toUpsert: (0,
                            s.A)(e.messages, e => ({
                                ...e,
                                chunks: e.chunks.map(e => ({
                                    s: e.s,
                                    i: e.i
                                }))
                            }))
                        })),
                        a(h.C.upsertChunkAreas({
                            areas: e.areas
                        }));
                        let t = Object.values(e.messages).flatMap(e => e.chunks.map(e => ({
                            s: e.s,
                            i: e.i
                        })));
                        a(eg.b.setHighlightedChunks({
                            chatId: r,
                            chunks: t
                        }))
                    }
                    ).catch( () => {
                        var e;
                        if (b.current.includes(r))
                            return;
                        let t = JSON.parse(null !== (e = localStorage.getItem("lastChatInfo")) && void 0 !== e ? e : "{}");
                        try {
                            if (null != t && t.chatId === r) {
                                let {uploadTime: e, pageLoadTime: n} = t
                                  , i = (Date.now() - e) / 1e3
                                  , l = (Date.now() - n) / 1e3;
                                console.log("chat-load-error", {
                                    chatId: r,
                                    secsSinceUpload: i,
                                    secsSincePageLoad: l
                                }),
                                a((0,
                                ef.A5)({
                                    event: "chat-load-error",
                                    eventProps: {
                                        chatId: r,
                                        secsSinceUpload: i,
                                        secsSincePageLoad: l
                                    }
                                }))
                            }
                        } catch (e) {
                            console.error("Error tracking chat-load-error", e)
                        }
                        a((0,
                        eE.d)("/"))
                    }
                    ).finally( () => a(eg.b.setIsLoading(!1))),
                    g.current.source.getSourceInfos.query(r).then(e => {
                        a(h.C.upsertSources(e))
                    }
                    ).catch( () => {
                        console.error("Error getting source infos", r)
                    }
                    ))
                }
            }
            , [r, a, v, x, b, y, g]);
            let k = (0,
            eI.al)() && "split" === w ? "chat" : w
              , {groupRef: S, defaultLayout: C, setLayout: N} = (0,
            eN.i)({
                id: "PanelGroup:chat",
                defaultLayout: {
                    pdf: 50,
                    conversation: 50
                }
            });
            return (0,
            l.useMemo)( () => null == r ? null : j ? "chat" === k ? (0,
            n.jsx)("div", {
                className: "h-full w-full flex justify-center",
                children: (0,
                n.jsx)(tF, {
                    chatId: r
                })
            }) : "pdf" === k ? (0,
            n.jsxs)("div", {
                className: "h-full w-full relative group",
                children: [!(0,
                eI.CN)() && (0,
                n.jsx)(ej, {
                    chatId: r
                }), !(0,
                eI.CN)() && (0,
                n.jsx)(K, {}), (0,
                n.jsx)(eC.FicoErrorBoundary, {
                    children: (0,
                    n.jsx)(t8, {
                        chatId: r
                    })
                })]
            }) : (0,
            n.jsxs)(n.Fragment, {
                children: [!(0,
                eI.CN)() && (0,
                n.jsx)(ej, {
                    chatId: r
                }), !(0,
                eI.CN)() && (0,
                n.jsx)(K, {}), (0,
                n.jsxs)(o.YJ, {
                    groupRef: S,
                    orientation: "horizontal",
                    className: "h-full overflow-visible",
                    defaultLayout: C,
                    onLayoutChange: N,
                    children: [(0,
                    n.jsx)(o.Zk, {
                        id: "pdf",
                        minSize: "100px",
                        children: (0,
                        n.jsx)(eC.FicoErrorBoundary, {
                            children: (0,
                            n.jsx)(t8, {
                                chatId: r
                            })
                        })
                    }), (0,
                    n.jsx)(eT.F, {}), (0,
                    n.jsx)(o.Zk, {
                        id: "conversation",
                        minSize: "200px",
                        className: "overflow-visible",
                        children: (0,
                        n.jsx)(eC.FicoErrorBoundary, {
                            children: (0,
                            n.jsx)(tF, {
                                chatId: r
                            })
                        })
                    })]
                })]
            }) : (0,
            n.jsx)(tF, {
                chatId: r
            }), [r, j, k, S, C, N])
        }
          , t9 = () => {
            let e = (0,
            a.useParams)()
              , t = (null == e ? void 0 : e.chat_id) != null ? i.rP.prefixChat(e.chat_id) : void 0
              , r = (0,
            u.G)(e => e.chats.chats);
            return (0,
            l.useEffect)( () => {
                var e, n;
                null == t || i.Wp.isEmpty(null === (e = r[t]) || void 0 === e ? void 0 : e.info.displayName) || (document.title = "".concat(null === (n = r[t]) || void 0 === n ? void 0 : n.info.displayName, " - ChatPDF"))
            }
            , [t, r]),
            (0,
            n.jsx)(t3, {
                chatId: t
            })
        }
    }
    ,
    97058: (e, t, r) => {
        "use strict";
        r.d(t, {
            B: () => f
        });
        var n = r(56148)
          , i = r(82496)
          , a = r(78968)
          , l = r(15450)
          , s = r(14460)
          , o = r(8425)
          , c = r(50100)
          , d = r(17142)
          , u = r(68989)
          , h = r(95516)
          , p = r(90421);
        let f = function() {
            let {namespace: e="Page.Chat"} = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
              , t = (0,
            u.j)()
              , r = (0,
            i.useTranslations)(e)
              , f = (0,
            d._)()
              , m = (0,
            p.al)()
              , g = (0,
            u.G)(e => e.ui.premiumModelSelected)
              , [x,v] = (0,
            a.useState)(f && g ? "high" : "fast")
              , b = (0,
            a.useCallback)(e => {
                if (f || "high" !== e) {
                    v(e);
                    let r = "high" === e;
                    (0,
                    s.Vb)(r),
                    t(h.e5.setPremiumModelSelected(r))
                } else
                    t((0,
                    c.A5)({
                        event: "model-selector-paywall-modal-viewed"
                    })),
                    t((0,
                    c.EW)({
                        reason: "modelUpgrade"
                    }))
            }
            , [t, f]);
            return m && "Page.YouTube" === e ? null : (0,
            n.jsxs)("div", {
                className: "relative inline-grid h-6 grid-cols-2 items-center rounded-full bg-primary-default p-0.5 select-none",
                role: "tablist",
                "aria-label": r("Quality"),
                children: [(0,
                n.jsx)("div", {
                    "aria-hidden": !0,
                    className: "pointer-events-none absolute inset-0.5",
                    children: (0,
                    n.jsx)("div", {
                        className: (0,
                        o.cn)("absolute inset-y-0 left-0 w-1/2 rounded-full bg-surface", "transition-transform duration-200 ease-[cubic-bezier(.2,.9,.2,1)] will-change-transform motion-reduce:transition-none", "high" === x && "translate-x-full")
                    })
                }), (0,
                n.jsx)(l.$, {
                    variant: "ghost",
                    size: "small",
                    role: "tab",
                    "aria-selected": "fast" === x,
                    onClick: () => b("fast"),
                    className: (0,
                    o.cn)("relative z-10 h-5 rounded-full px-2", "text-center text-xs leading-none tracking-tight font-[510]", "transition-none", "before:hidden hover:before:hidden", "bg-transparent hover:bg-transparent", "fast" === x ? "text-primary hover:text-primary" : "text-text-inverse hover:text-text-inverse"),
                    children: r("Fast")
                }), (0,
                n.jsx)(l.$, {
                    variant: "ghost",
                    size: "small",
                    role: "tab",
                    "aria-selected": "high" === x,
                    onClick: () => b("high"),
                    className: (0,
                    o.cn)("relative z-10 h-5 rounded-full px-2", "text-center text-xs leading-none tracking-tight font-[510]", "transition-none", "before:hidden hover:before:hidden", "bg-transparent hover:bg-transparent", "high" === x ? "text-primary hover:text-primary" : "text-text-inverse hover:text-text-inverse"),
                    children: r("Quality")
                })]
            })
        }
    }
    ,
    20398: (e, t, r) => {
        "use strict";
        r.d(t, {
            b: () => l
        });
        var n = r(56148);
        let i = {
            src: "/_next/static/media/AvatarLogo.9ba2cd98.svg",
            height: 30,
            width: 20,
            blurWidth: 0,
            blurHeight: 0
        };
        var a = r(85228);
        let l = e => (0,
        n.jsx)(a._, {
            svg: i,
            ...e
        })
    }
    ,
    12227: (e, t, r) => {
        "use strict";
        r.d(t, {
            G: () => l
        });
        var n = r(56148);
        let i = {
            src: "/_next/static/media/FicoSpin.705a5b10.svg",
            height: 44,
            width: 44,
            blurWidth: 0,
            blurHeight: 0
        };
        var a = r(85228);
        let l = e => {
            var t, r;
            return (0,
            n.jsx)(a._, {
                svg: i,
                width: null !== (t = e.width) && void 0 !== t ? t : 22,
                height: null !== (r = e.height) && void 0 !== r ? r : 22,
                ...e
            })
        }
    }
    ,
    85228: (e, t, r) => {
        "use strict";
        r.d(t, {
            _: () => a
        });
        var n = r(56148)
          , i = r(1474);
        let a = e => {
            let t = e.iconSized ? 16 : e.width
              , r = e.iconSized ? 16 : e.height;
            return (0,
            n.jsx)(i.default, {
                width: t,
                height: r,
                src: e.svg,
                alt: "",
                style: e.style,
                className: e.className,
                loading: "lazy"
            })
        }
    }
    ,
    35991: (e, t, r) => {
        "use strict";
        r.d(t, {
            M5: () => f,
            SQ: () => p,
            _2: () => m,
            lp: () => x,
            lv: () => d,
            mB: () => g,
            nV: () => h,
            rI: () => c,
            ty: () => u
        });
        var n = r(56148)
          , i = r(62569)
          , a = r(66146)
          , l = r(78968)
          , s = r(60315)
          , o = r(8425);
        function c(e) {
            let {dir: t, ...r} = e
              , a = (0,
            s.jH)();
            return (0,
            n.jsx)(i.bL, {
                "data-slot": "dropdown-menu",
                dir: null != t ? t : a,
                ...r
            })
        }
        function d(e) {
            let {...t} = e;
            return (0,
            n.jsx)(i.Pb, {
                "data-slot": "dropdown-menu-sub",
                ...t
            })
        }
        function u(e) {
            let {className: t, ...r} = e;
            return (0,
            n.jsx)(i.l9, {
                "data-slot": "dropdown-menu-trigger",
                className: (0,
                o.cn)("focus:outline-none", t),
                ...r
            })
        }
        function h(e) {
            let {className: t, inset: r, variant: l="default", ...c} = e
              , d = (0,
            s.jH)();
            return (0,
            n.jsxs)(i.ZP, {
                "data-slot": "dropdown-menu-sub-trigger",
                "data-inset": r,
                "data-variant": l,
                className: (0,
                o.cn)(["flex", "px-1.5 py-2.5", "items-center gap-1 self-stretch rounded-md", "before:absolute before:inset-0 before:pointer-events-none before:content-[''] before:transition-all before:duration-200 before:z-0", "before:rounded-md", "hover:before:bg-state-layer-neutral-hover", "hover:text-text-main", "sm:active:before:bg-state-layer-neutral-pressed", "focus:before:bg-state-layer-neutral-hover", "[&_svg:not([class*='text-'])]:text-muted-foreground", "cursor-default outline-hidden select-none", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "data-[disabled]:before:hidden", "data-[inset]:ps-8", "[&_svg]:pointer-events-none", "[&_svg]:w-[var(--text-sm)]", "[&_svg]:h-[var(--text-sm)]", "w-full", "truncate", "text-text-subtle", "font-font-family", "text-sm", "font-medium", "leading-none", "tracking-letter-spacing-sm", "cursor-pointer", "relative"], t),
                ...c,
                children: [c.children, (0,
                n.jsx)(a.A, {
                    className: (0,
                    o.cn)("transition-transform", "rtl" === d && "rotate-180"),
                    style: {
                        marginInlineStart: "auto"
                    }
                })]
            })
        }
        function p(e) {
            let {className: t, sideOffset: r=4, grid: a=!1, gridCols: l=2, align: s, ...c} = e;
            return (0,
            n.jsx)(i.ZL, {
                children: (0,
                n.jsx)(i.UC, {
                    "data-slot": "dropdown-menu-content",
                    sideOffset: r,
                    collisionPadding: 8,
                    align: null != s ? s : "start",
                    className: (0,
                    o.cn)(["bg-elevation-1", "p-1", "border border-border-default", "text-popover-foreground", "data-[state=open]:animate-in", "data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0", "data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95", "data-[state=open]:zoom-in-95", "data-[side=bottom]:slide-in-from-top-2", "data-[side=left]:slide-in-from-right-2", "data-[side=right]:slide-in-from-left-2", "data-[side=top]:slide-in-from-bottom-2", "z-100", a ? "grid grid-cols-".concat(l, " gap-1") : "min-w-[8rem]", "max-h-[var(--radix-dropdown-menu-content-available-height)]", "max-w-[var(--radix-dropdown-menu-content-available-width)]", "overflow-y-auto", "rounded-lg", "shadow-[0_4px_6px_0_rgba(0,0,0,0.08)]"], t),
                    ...c
                })
            })
        }
        function f(e) {
            let {className: t, grid: r=!1, gridCols: a=2, ...l} = e;
            return (0,
            n.jsx)(i.ZL, {
                children: (0,
                n.jsx)(i.G5, {
                    "data-slot": "dropdown-menu-sub-content",
                    sideOffset: 2,
                    alignOffset: -5,
                    className: (0,
                    o.cn)(["dropdown", "bg-elevation-1", "p-1", "border border-border-default", "text-popover-foreground", "data-[state=open]:animate-in", "data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0", "data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95", "data-[state=open]:zoom-in-95", "data-[side=bottom]:slide-in-from-top-2", "data-[side=left]:slide-in-from-right-2", "data-[side=right]:slide-in-from-left-2", "data-[side=top]:slide-in-from-bottom-2", "z-100", r ? "grid grid-cols-".concat(a, " gap-1") : "min-w-[8rem]", "max-h-[var(--radix-dropdown-menu-content-available-height)]", "max-w-[var(--radix-dropdown-menu-content-available-width)]", "overflow-y-auto", "rounded-lg", "shadow-[0_4px_6px_0_rgba(0,0,0,0.08)]"], t),
                    onClick: e => e.stopPropagation(),
                    ...l
                })
            })
        }
        function m(e) {
            let {className: t, inset: r, variant: a="default", ...l} = e;
            return (0,
            n.jsx)(i.q7, {
                "data-slot": "dropdown-menu-item",
                "data-inset": r,
                "data-variant": a,
                className: (0,
                o.cn)(["flex", "px-1.5 py-2.5", "items-center gap-1 self-stretch rounded-md", "before:absolute before:inset-0 before:pointer-events-none before:content-[''] before:transition-all before:duration-200 before:z-0", "before:rounded-md", "hover:before:bg-state-layer-neutral-hover", "hover:text-text-main", "sm:active:before:bg-state-layer-neutral-pressed", "focus:before:bg-state-layer-neutral-hover", "[&_svg:not([class*='text-'])]:text-muted-foreground", "cursor-default outline-hidden select-none", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50", "data-[disabled]:before:hidden", "data-[inset]:ps-8", "[&_svg]:pointer-events-none", "[&_svg]:w-3.5", "[&_svg]:h-3.5", "w-full", "text-text-subtle", "truncate", "font-font-family", "text-sm", "font-medium", "leading-none", "tracking-letter-spacing-sm", "cursor-pointer", "relative"], t),
                ...l,
                onClick: e => {
                    var t;
                    e.stopPropagation(),
                    null === (t = l.onClick) || void 0 === t || t.call(l, e)
                }
            })
        }
        let g = l.forwardRef( (e, t) => {
            let {className: r, ...a} = e;
            return (0,
            n.jsx)(i.wv, {
                ref: t,
                className: (0,
                o.cn)("-mx-1 my-1 h-px bg-border-default", r),
                ...a
            })
        }
        );
        g.displayName = i.wv.displayName;
        let x = l.forwardRef( (e, t) => {
            let {className: r, inset: a, ...l} = e;
            return (0,
            n.jsx)(i.JU, {
                ref: t,
                className: (0,
                o.cn)("px-2 py-1.5 font-medium text-text-main", a && "ps-8", r),
                ...l
            })
        }
        );
        x.displayName = i.JU.displayName
    }
    ,
    41934: (e, t, r) => {
        "use strict";
        r.d(t, {
            F: () => c
        });
        var n = r(56148)
          , i = r(70764)
          , a = r(98840)
          , l = r(78968)
          , s = r(8425);
        let o = (0,
        a.F)(["inline-flex items-center justify-center flex-shrink-0", "transition-all duration-200", "focus-visible:outline-none", "disabled:pointer-events-none", "relative overflow-hidden", "[&_svg]:pointer-events-none", "[&_svg]:shrink-0", "[&_svg]:relative [&_svg]:z-1", "cursor-pointer"], {
            variants: {
                variant: {
                    primary: ["bg-primary text-white", "before:absolute before:inset-0 before:pointer-events-none before:content-[''] before:transition-all before:duration-200", "hover:before:bg-state-layer-primary-hover", "sm:active:bg-primary sm:active:before:bg-state-layer-primary-pressed", "focus-visible:bg-primary focus-visible:text-white", "focus-visible:shadow-[0_0_0_2px_rgb(255_255_255),0_0_0_6px_rgb(114_18_183)]", "disabled:bg-elevation-2 disabled:text-text-subtlest", "disabled:border disabled:border-border-disabled", "disabled:before:hidden"],
                    ghost: ["text-text-main", "before:absolute before:inset-0 before:pointer-events-none before:content-[''] before:transition-all before:duration-200 before:z-0", "hover:before:bg-state-layer-neutral-hover hover:text-text-main", "sm:active:before:bg-state-layer-neutral-pressed", "focus-visible:shadow-[0_0_0_2px_rgb(255_255_255),0_0_0_6px_rgb(114_18_183)]", "disabled:text-text-subtlest", "disabled:before:hidden"]
                },
                size: {
                    sm: "size-6 rounded-sm before:rounded-sm [&_svg]:size-3.5",
                    md: "size-8 rounded-md before:rounded-md [&_svg]:size-4",
                    big: "size-10 rounded-md before:rounded-md [&_svg]:size-6"
                }
            },
            defaultVariants: {
                variant: "ghost",
                size: "md"
            }
        })
          , c = l.forwardRef( (e, t) => {
            let {className: r, variant: a, size: l, asChild: c=!1, ...d} = e
              , u = c ? i.DX : "button";
            return (0,
            n.jsx)(u, {
                className: (0,
                s.cn)(o({
                    variant: a,
                    size: l,
                    className: r
                })),
                ref: t,
                ...d
            })
        }
        );
        c.displayName = "IconButtonShadcn"
    }
    ,
    4298: (e, t, r) => {
        "use strict";
        r.d(t, {
            p: () => l
        });
        var n = r(56148)
          , i = r(78968)
          , a = r(8425);
        let l = i.forwardRef( (e, t) => {
            let {className: r, type: i, ...l} = e;
            return (0,
            n.jsx)("input", {
                ref: t,
                type: i,
                "data-slot": "input",
                className: (0,
                a.cn)("file:text-foreground placeholder:text-text-subtlest flex flex-shrink-0 h-10 md:h-9 w-full min-w-0 rounded-md border border-border-default bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", "focus-visible:border-primary focus-visible:ring-primary/60 focus-visible:ring-[1px]", "aria-invalid:ring-destructive/20 aria-invalid:border-destructive", r),
                ...l
            })
        }
        );
        l.displayName = "Input"
    }
    ,
    70041: (e, t, r) => {
        "use strict";
        r.d(t, {
            AM: () => s,
            Wv: () => o,
            dT: () => d,
            hl: () => c
        });
        var n = r(56148)
          , i = r(220);
        r(78968);
        var a = r(60315)
          , l = r(8425);
        function s(e) {
            let {...t} = e;
            return (0,
            n.jsx)(i.bL, {
                "data-slot": "popover",
                ...t
            })
        }
        function o(e) {
            let {...t} = e;
            return (0,
            n.jsx)(i.l9, {
                "data-slot": "popover-trigger",
                ...t
            })
        }
        function c(e) {
            let {className: t, align: r="center", sideOffset: s=4, showArrow: o=!0, dir: c, ...d} = e
              , u = (0,
            a.jH)();
            return (0,
            n.jsx)(i.ZL, {
                children: (0,
                n.jsxs)(i.UC, {
                    "data-slot": "popover-content",
                    align: r,
                    sideOffset: s,
                    dir: null != c ? c : u,
                    className: (0,
                    l.cn)("bg-white text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border-0 p-4 shadow-[0_0_10px_rgba(0,0,0,0.15)] outline-hidden", t),
                    ...d,
                    children: [d.children, o && (0,
                    n.jsx)(i.i3, {
                        className: "fill-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.2)]",
                        width: 12,
                        height: 6
                    })]
                })
            })
        }
        function d(e) {
            let {...t} = e;
            return (0,
            n.jsx)(i.Mz, {
                "data-slot": "popover-anchor",
                ...t
            })
        }
    }
    ,
    50292: (e, t, r) => {
        "use strict";
        r.d(t, {
            T: () => a
        });
        var n = r(56148);
        r(78968);
        var i = r(8425);
        function a(e) {
            let {className: t, ...r} = e;
            return (0,
            n.jsx)("textarea", {
                "data-slot": "textarea",
                className: (0,
                i.cn)("resize-none border-border-default placeholder:text-text-subtlest aria-invalid:ring-destructive/20 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 text-md sm:text-sm", "focus-visible:border-primary focus-visible:ring-primary/60 focus-visible:ring-[1px]", t),
                ...r
            })
        }
    }
    ,
    99011: (e, t, r) => {
        "use strict";
        r.d(t, {
            ZI: () => d,
            k$: () => c,
            m_: () => o
        });
        var n = r(56148)
          , i = r(36144);
        r(78968);
        var a = r(60315)
          , l = r(8425);
        function s(e) {
            let {delayDuration: t=0, ...r} = e;
            return (0,
            n.jsx)(i.Kq, {
                "data-slot": "tooltip-provider",
                delayDuration: t,
                ...r
            })
        }
        function o(e) {
            let {...t} = e;
            return (0,
            n.jsx)(s, {
                children: (0,
                n.jsx)(i.bL, {
                    "data-slot": "tooltip",
                    disableHoverableContent: !0,
                    ...t
                })
            })
        }
        function c(e) {
            let {...t} = e;
            return (0,
            n.jsx)(i.l9, {
                "data-slot": "tooltip-trigger",
                ...t
            })
        }
        function d(e) {
            let {className: t, sideOffset: r=0, children: s, style: o, dir: c, ...d} = e
              , u = (0,
            a.jH)();
            return (0,
            n.jsx)(i.ZL, {
                children: (0,
                n.jsxs)(i.UC, {
                    "data-slot": "tooltip-content",
                    sideOffset: r,
                    dir: null != c ? c : u,
                    className: (0,
                    l.cn)("shadcn-tooltip-content bg-black text-white animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-100 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance", t),
                    style: {
                        pointerEvents: "none",
                        ...o
                    },
                    ...d,
                    children: [s, (0,
                    n.jsx)(i.i3, {
                        className: "bg-black fill-black z-100 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]"
                    })]
                })
            })
        }
    }
    ,
    52526: (e, t, r) => {
        "use strict";
        r.d(t, {
            FicoTooltip: () => s
        });
        var n = r(56148)
          , i = r(90421)
          , a = r(99011)
          , l = r(60315);
        let s = e => {
            let {children: t, title: r, content: s, placement: o="top"} = e
              , c = (0,
            i.al)()
              , d = (0,
            l.jH)()
              , u = s || r;
            return c || !u ? (0,
            n.jsx)(n.Fragment, {
                children: t
            }) : (0,
            n.jsxs)(a.m_, {
                children: [(0,
                n.jsx)(a.k$, {
                    asChild: !0,
                    children: (0,
                    n.jsx)("span", {
                        children: t
                    })
                }), (0,
                n.jsx)(a.ZI, {
                    side: "rtl" === d && "right" === o ? "left" : "rtl" === d && "left" === o ? "right" : o,
                    className: "py-2 text-sm max-w-[300px]",
                    children: u
                })]
            })
        }
    }
    ,
    88932: (e, t, r) => {
        "use strict";
        r.d(t, {
            F: () => s
        });
        var n = r(56148)
          , i = r(78968)
          , a = r(63109)
          , l = r(8425);
        let s = e => {
            let {onResizeStart: t, onResizeEnd: r} = e
              , s = (0,
            i.useRef)(null)
              , o = (0,
            i.useRef)(!1);
            (0,
            i.useEffect)( () => {
                let e = s.current;
                if (!e)
                    return;
                let n = new MutationObserver( () => {
                    let n = "active" === e.getAttribute("data-separator");
                    n && !o.current ? (o.current = !0,
                    null == t || t()) : !n && o.current && (o.current = !1,
                    null == r || r())
                }
                );
                return n.observe(e, {
                    attributes: !0,
                    attributeFilter: ["data-separator"]
                }),
                () => {
                    n.disconnect()
                }
            }
            , [t, r]);
            let c = (0,
            i.useCallback)(e => {
                s.current = e
            }
            , []);
            return (0,
            n.jsxs)(a.wv, {
                elementRef: c,
                className: "desktop-only group relative h-full w-px bg-transparent outline-none focus:outline-none focus-visible:outline-none",
                children: [(0,
                n.jsx)("div", {
                    className: (0,
                    l.cn)("absolute inset-y-0 left-1/2 z-[1000] -translate-x-1/2 w-[3px]", "bg-border-primary", "opacity-0", "transition-opacity duration-200", "group-data-[separator=hover]:opacity-100", "group-data-[separator=active]:opacity-100")
                }), (0,
                n.jsx)("div", {
                    className: "absolute inset-y-0 right-0 w-0 border-r border-border-default"
                })]
            })
        }
    }
    ,
    2431: (e, t, r) => {
        "use strict";
        r.d(t, {
            FicoErrorBoundary: () => s
        });
        var n = r(56148)
          , i = r(78968)
          , a = r(26787)
          , l = r(21821);
        class s extends i.Component {
            static getDerivedStateFromError(e) {
                return {
                    hasError: !0,
                    error: e
                }
            }
            componentDidCatch(e, t) {
                if (console.error("componentDidCatch", {
                    error: e,
                    errorInfo: t
                }),
                (0,
                l.me)()) {
                    var r, n, i, s, o;
                    let c;
                    c = null !== (n = null === (r = (0,
                    a.P)()) || void 0 === r ? void 0 : r.slice(1)) && void 0 !== n ? n : void 0,
                    null === l.bC || void 0 === l.bC || l.bC.capture("client-exception", {
                        message: null == e ? void 0 : e.message,
                        name: null == e ? void 0 : e.name,
                        stack: null !== (i = null == e ? void 0 : e.stack) && void 0 !== i ? i : null,
                        digest: null !== (s = null == t ? void 0 : t.digest) && void 0 !== s ? s : null,
                        componentStack: null !== (o = null == t ? void 0 : t.componentStack) && void 0 !== o ? o : null,
                        atoken: null != c ? c : null
                    })
                }
            }
            render() {
                if (this.state.hasError) {
                    var e;
                    return (0,
                    n.jsxs)("div", {
                        className: "p-12",
                        children: [(0,
                        n.jsx)("h1", {
                            className: "font-onest text-2xl font-bold",
                            children: "Something went wrong!"
                        }), (0,
                        n.jsxs)("p", {
                            className: "mt-4",
                            children: ["We", "'", "re sorry, an error has occurred. If this error persists, please contact", " ", (0,
                            n.jsx)("a", {
                                href: "mailto:support@chatpdf.com",
                                className: "text-purple-600 underline hover:text-purple-800",
                                children: "support@chatpdf.com"
                            }), "."]
                        }), (null === (e = this.state.error) || void 0 === e ? void 0 : e.stack) && (0,
                        n.jsx)("div", {
                            className: "mt-2.5 whitespace-pre-wrap break-words font-mono text-red-600 text-xs",
                            children: this.state.error.stack.split("\n").slice(0, 4).map(e => e.replace(/\((.+)\)$/, (e, t) => {
                                let r = t.lastIndexOf("/");
                                return -1 === r ? e : "(".concat(t.slice(r + 1), ")")
                            }
                            )).join("\n")
                        }), (0,
                        n.jsx)("button", {
                            onClick: this.handleReset,
                            className: "mt-5 cursor-pointer rounded-md border-none bg-[#a026ff] px-5 py-2.5 text-white hover:bg-[#8a1fe0]",
                            children: "Try again"
                        })]
                    })
                }
                return this.props.children
            }
            constructor(e) {
                super(e),
                this.handleReset = () => {
                    window.location.href = "/"
                }
                ,
                this.state = {
                    hasError: !1,
                    error: null
                }
            }
        }
    }
    ,
    54455: (e, t, r) => {
        "use strict";
        r.d(t, {
            FicoI18nProviderClient: () => c
        });
        var n = r(56148)
          , i = r(29553)
          , a = r(82496)
          , l = r(26787)
          , s = r(21821)
          , o = r(37811);
        let c = e => {
            let t = (0,
            a.useMessages)()
              , {locale: r, children: c, messages: d} = e
              , u = (0,
            i.A)({}, t, d);
            return (0,
            n.jsx)(a.NextIntlClientProvider, {
                onError: e => {
                    var t, r, n;
                    let i;
                    if (console.log(e),
                    i = null !== (r = null === (t = (0,
                    l.P)()) || void 0 === t ? void 0 : t.slice(1)) && void 0 !== r ? r : void 0,
                    null === s.bC || void 0 === s.bC || s.bC.capture("i18n-error", {
                        message: e.message,
                        name: e.name,
                        stack: null !== (n = e.stack) && void 0 !== n ? n : null,
                        atoken: null != i ? i : null
                    }),
                    console.log("THROW_ON_I18N_ERROR", o.env.THROW_ON_I18N_ERROR),
                    o.env.THROW_ON_I18N_ERROR)
                        throw e
                }
                ,
                messages: u,
                locale: r,
                timeZone: "America/New_York",
                children: c
            })
        }
    }
    ,
    63214: (e, t, r) => {
        "use strict";
        r.d(t, {
            N_: () => l,
            a8: () => s,
            kL: () => c,
            rd: () => o
        });
        var n = r(62546)
          , i = r(15512)
          , a = r(80705);
        let {Link: l, usePathname: s, useRouter: o} = (0,
        i.xp)(a.D)
          , c = a.D.locales.slice().sort( (e, t) => n.eo[e].name.localeCompare(n.eo[t].name))
    }
    ,
    80705: (e, t, r) => {
        "use strict";
        r.d(t, {
            D: () => l,
            g: () => a.a
        });
        var n = r(38577)
          , i = r(69646)
          , a = r.n(i);
        let l = (0,
        r(41779).o)({
            locales: n.rK,
            defaultLocale: n.sw.En,
            localePrefix: "as-needed",
            pathnames: {
                "/": "/",
                "/ai-detector": "/ai-detector",
                "/ai-detector/check": "/ai-detector/check",
                "/c/[chat_id]": "/c/[chat_id]",
                "/s/[slide_id]": "/s/[slide_id]",
                "/literature-review": "/literature-review",
                "/application/mobile": "/application/mobile",
                "/application/desktop": "/application/desktop",
                "/mobile-app/download": "/mobile-app/download",
                "/flashcards/[deckId]": "/flashcards/[deckId]",
                "/flashcards/[deckId]/practice": "/flashcards/[deckId]/practice",
                "/literature-review/[litReviewId]": "/literature-review/[litReviewId]",
                "/scholar": "/scholar",
                "/scholar/q?q=:query": "/scholar/q?q=:query",
                "/pdf-ai": {
                    ar: "/pdf-ai",
                    bg: "/pdf-ai",
                    bn: "/pdf-ai",
                    cs: "/pdf-ai",
                    da: "/pdf-ai",
                    de: "/pdf-ki",
                    el: "/pdf-ai",
                    en: "/pdf-ai",
                    es: "/pdf-ia",
                    fi: "/pdf-ai",
                    fr: "/pdf-ia",
                    he: "/pdf-ai",
                    hi: "/pdf-ai",
                    hr: "/pdf-ai",
                    hu: "/pdf-ai",
                    id: "/pdf-ai",
                    it: "/pdf-ai",
                    ja: "/pdf-ai",
                    kn: "/pdf-ai",
                    ko: "/pdf-ai",
                    ms: "/pdf-ai",
                    nl: "/pdf-ai",
                    no: "/pdf-ai",
                    pa: "/pdf-ai",
                    pl: "/pdf-ai",
                    pt: "/pdf-ia",
                    "pt-PT": "/pdf-ia",
                    ro: "/pdf-ai",
                    ru: "/pdf-ai",
                    sk: "/pdf-ai",
                    sv: "/pdf-ai",
                    ta: "/pdf-ai",
                    th: "/pdf-ai",
                    tl: "/pdf-ai",
                    tr: "/pdf-ai",
                    uk: "/pdf-ai",
                    vi: "/pdf-ai",
                    "zh-TW": "/pdf-ai",
                    zh: "/pdf-ai"
                },
                "/pdf-summary": {
                    ar: "/ملخص-PDF",
                    bg: "/pdf-obobshtenie",
                    bn: "/pdf-saaransh",
                    cs: "/pdf-shrnuti",
                    da: "/pdf-sammendrag",
                    de: "/pdf-zusammenfassung",
                    el: "/perilipsi-pdf",
                    en: "/pdf-summary",
                    es: "/pdf-resumen",
                    fi: "/pdf-yhteenveto",
                    fr: "/pdf-resume",
                    he: "/תקציר-PDF",
                    hi: "/pdf-saaransh",
                    hr: "/pdf-sazetak",
                    hu: "/pdf-osszefoglalo",
                    id: "/pdf-ringkasan",
                    it: "/pdf-riepilogo",
                    ja: "/pdf-yoyaku",
                    kn: "/pdf-saaransh",
                    ko: "/pdf-yoyak",
                    ms: "/pdf-ringkasan",
                    nl: "/pdf-samenvatting",
                    no: "/pdf-sammendrag",
                    pa: "/pdf-saaransh",
                    pl: "/pdf-podsumowanie",
                    pt: "/pdf-resumo",
                    "pt-PT": "/pdf-resumo",
                    ro: "/rezumat-pdf",
                    ru: "/pdf-rezjume",
                    sk: "/pdf-zhrnutie",
                    sv: "/pdf-sammanfattning",
                    ta: "/pdf-surukkam",
                    th: "/pdf-sarup",
                    tl: "/buod-pdf",
                    tr: "/pdf-ozet",
                    uk: "/pdf-summary",
                    vi: "/pdf-tom-tat",
                    "zh-TW": "/pdf-zhaiyao",
                    zh: "/pdf-zhaiyao"
                },
                "/ai-writer": {
                    ar: "/كاتب-AI",
                    bg: "/ai-pisatel",
                    bn: "/ai-lekhok",
                    cs: "/ai-spisovatel",
                    da: "/ai-skribent",
                    de: "/ki-schreiber",
                    el: "/syggrafeas-ai",
                    en: "/ai-writer",
                    es: "/escritor-ia",
                    fi: "/tekoaly-kirjoittaja",
                    fr: "/redacteur-ia",
                    he: "/כותב-AI",
                    hi: "/ai-lekhak",
                    hr: "/ai-pisac",
                    hu: "/ai-iro",
                    id: "/penulis-ai",
                    it: "/scrittore-ia",
                    ja: "/ai-raita",
                    kn: "/ai-lekhaka",
                    ko: "/ai-jakka",
                    ms: "/penulis-ai",
                    nl: "/ai-schrijver",
                    no: "/ai-skribent",
                    pa: "/ai-lekhak",
                    pl: "/pisarz-ai",
                    pt: "/escritor-ia",
                    "pt-PT": "/escritor-ia",
                    ro: "/scriitor-ai",
                    ru: "/ai-pisatel",
                    sk: "/ai-spisovatel",
                    sv: "/ai-skribent",
                    ta: "/ai-eluthalar",
                    th: "/nak-khian-ai",
                    tl: "/manunulat-ai",
                    tr: "/yapay-zeka-yazari",
                    uk: "/ai-writer",
                    vi: "/nha-van-ai",
                    "zh-TW": "/ai-xieshou",
                    zh: "/ai-xieshou"
                },
                "/youtube": "/youtube",
                "/yt/[chat_id]": "/yt/[chat_id]",
                "/writer": "/writer",
                "/writer/[doc_id]": "/writer/[doc_id]",
                "/ai-flashcards": {
                    ar: "/بطاقات-تعليمية-AI",
                    bg: "/ai-fleshkarti",
                    bn: "/ai-flashcards",
                    cs: "/ai-karticky",
                    da: "/ai-flashkort",
                    de: "/ki-karteikarten",
                    el: "/karteles-ai",
                    en: "/ai-flashcards",
                    es: "/tarjetas-ia",
                    fi: "/tekoaly-muistikortit",
                    fr: "/cartes-memoire-ia",
                    he: "/כרטיסיות-AI",
                    hi: "/ai-flashcards",
                    hr: "/ai-kartice",
                    hu: "/ai-tanulokartyak",
                    id: "/kartu-flash-ai",
                    it: "/flashcard-ia",
                    ja: "/ai-flashcards",
                    kn: "/ai-flashcards",
                    ko: "/ai-flashcards",
                    ms: "/kad-flash-ai",
                    nl: "/ai-flashcards",
                    no: "/ai-flashkort",
                    pa: "/ai-flashcards",
                    pl: "/fiszki-ai",
                    pt: "/flashcards-ia",
                    "pt-PT": "/flashcards-ia",
                    ro: "/carduri-ai",
                    ru: "/ai-kartochki",
                    sk: "/ai-karticky",
                    sv: "/ai-flashkort",
                    ta: "/ai-ninaivattai",
                    th: "/ai-flashcards",
                    tl: "/ai-flashcards",
                    tr: "/yapay-zeka-kartlari",
                    uk: "/ai-flashcards",
                    vi: "/the-ghi-nho-ai",
                    "zh-TW": "/ai-flashcards",
                    zh: "/ai-flashcards"
                },
                "/ai-slides": {
                    ar: "/شرائح-AI",
                    bg: "/ai-slajdove",
                    bn: "/ai-slides",
                    cs: "/ai-prezentace",
                    da: "/ai-slides",
                    de: "/ki-folien",
                    el: "/diafaneies-ai",
                    en: "/ai-slides",
                    es: "/diapositivas-ia",
                    fi: "/tekoaly-diat",
                    fr: "/diaporama-ia",
                    he: "/מצגת-AI",
                    hi: "/ai-slides",
                    hr: "/ai-slajdovi",
                    hu: "/ai-diak",
                    id: "/slide-ai",
                    it: "/diapositive-ia",
                    ja: "/ai-slides",
                    kn: "/ai-slides",
                    ko: "/ai-slides",
                    ms: "/slaid-ai",
                    nl: "/ai-slides",
                    no: "/ai-lysbilder",
                    pa: "/ai-slides",
                    pl: "/slajdy-ai",
                    pt: "/slides-ia",
                    "pt-PT": "/slides-ia",
                    ro: "/slide-uri-ai",
                    ru: "/ai-slajdy",
                    sk: "/ai-prezentacia",
                    sv: "/ai-bilder",
                    ta: "/ai-slaidugal",
                    th: "/ai-slides",
                    tl: "/ai-slides",
                    tr: "/yapay-zeka-slaytlari",
                    uk: "/ai-slides",
                    vi: "/trinh-chieu-ai",
                    "zh-TW": "/ai-slides",
                    zh: "/ai-slides"
                }
            }
        })
    }
    ,
    60315: (e, t, r) => {
        "use strict";
        r.d(t, {
            jH: () => l,
            x7: () => a
        });
        var n = r(62546)
          , i = r(82496);
        let a = () => {
            let e = (0,
            i.useLocale)();
            return n.rK.includes(e) ? e : n.sw.En
        }
          , l = () => o(a())
          , s = [n.sw.Ar, n.sw.He]
          , o = e => s.includes(e) ? "rtl" : "ltr"
    }
    ,
    43305: (e, t, r) => {
        "use strict";
        r.d(t, {
            I: () => s,
            p: () => o
        });
        var n = r(33900)
          , i = r(86515);
        let a = "files";
        class l {
            async init() {
                if (this.db)
                    return {
                        db: this.db
                    };
                this.db = await (0,
                n.P2)("file-cache", 1, {
                    upgrade(e) {
                        e.createObjectStore(a)
                    }
                });
                let e = this.db.transaction(a, "readonly").objectStore(a)
                  , t = await e.getAll();
                return this.currentSize = t.reduce( (e, t) => e + t.size, 0),
                {
                    db: this.db
                }
            }
            async set(e, t) {
                let {db: r} = await this.init()
                  , n = t.length
                  , i = {
                    blob: t,
                    size: n,
                    lastAccessed: Date.now()
                };
                this.currentSize + n > 0x20000000 && await this.evictEntries(n);
                let l = r.transaction(a, "readwrite")
                  , s = l.objectStore(a)
                  , o = await s.get(e);
                o && (this.currentSize -= o.size),
                await s.put(i, e),
                this.currentSize += n,
                await l.done
            }
            async get(e) {
                let {db: t} = await this.init()
                  , r = t.transaction(a, "readwrite")
                  , n = r.objectStore(a)
                  , i = await n.get(e);
                return i ? (i.lastAccessed = Date.now(),
                await n.put(i, e),
                await r.done,
                i.blob) : null
            }
            async delete(e) {
                let {db: t} = await this.init()
                  , r = t.transaction(a, "readwrite")
                  , n = r.objectStore(a)
                  , i = await n.get(e);
                i && (this.currentSize -= i.size,
                await n.delete(e)),
                await r.done
            }
            async evictEntries(e) {
                let {db: t} = await this.init()
                  , r = t.transaction(a, "readwrite")
                  , n = r.objectStore(a)
                  , i = await n.getAllKeys()
                  , l = await n.getAll()
                  , s = i.map( (e, t) => ({
                    key: e,
                    ...l[t]
                }));
                s.sort( (e, t) => e.lastAccessed - t.lastAccessed);
                let o = Date.now() - 2592e6
                  , c = 0;
                for (let t of s)
                    (this.currentSize - c + e > 0x20000000 || t.lastAccessed < o) && (await n.delete(t.key),
                    c += t.size);
                this.currentSize -= c,
                await r.done
            }
            constructor() {
                this.db = null,
                this.currentSize = 0
            }
        }
        let s = new l
          , o = async (e, t) => {
            (0,
            i.Pi)(t) && await s.set(e, t)
        }
    }
    ,
    47486: (e, t, r) => {
        "use strict";
        r.d(t, {
            $o: () => a,
            Hr: () => c,
            Iz: () => l,
            YF: () => o,
            ZV: () => s,
            gi: () => u
        });
        var n = r(78968)
          , i = r(46040);
        let a = () => l() ? "desktop" : navigator.userAgent.startsWith("ChatPDF/iOS/") ? "ios" : navigator.userAgent.startsWith("ChatPDF/Android/") ? "android" : "web"
          , l = () => null != window.todesktop
          , s = () => {
            let[e,t] = (0,
            n.useState)(!1);
            return (0,
            i.A)( () => t(l())),
            e
        }
          , o = () => {
            let e = a();
            return "ios" === e || "android" === e
        }
          , c = () => {
            let[e,t] = (0,
            n.useState)(!1);
            return (0,
            i.A)( () => t(o())),
            e
        }
          , d = e => {
            let t = e.match(/ChatPDF\/([a-zA-Z]+)\/(\d+)/);
            return t ? parseInt(t[2], 10) : null
        }
          , u = () => {
            let e = a()
              , t = d(navigator.userAgent);
            return null == t || ("ios" === e ? t <= 18 && t >= 4 : "android" !== e || t >= 8)
        }
    }
    ,
    14460: (e, t, r) => {
        "use strict";
        r.d(t, {
            PC: () => a,
            Vb: () => l,
            c0: () => o,
            u3: () => s
        });
        let n = "premiumModelSelected"
          , i = "expandedCollectionChatId"
          , a = () => "true" === localStorage.getItem(n)
          , l = e => localStorage.setItem(n, e.toString())
          , s = () => {
            let e = localStorage.getItem(i);
            return e ? JSON.parse(e) : null
        }
          , o = e => localStorage.setItem(i, JSON.stringify(e))
    }
    ,
    8013: (e, t, r) => {
        "use strict";
        r.d(t, {
            i: () => a
        });
        var n = r(78968)
          , i = r(63109);
        function a(e) {
            let {id: t, defaultLayout: r, isSSR: a=!1, shouldSave: l} = e
              , s = "chatpdf-panel-layout-".concat(t)
              , o = (0,
            i.OG)()
              , c = ( () => {
                if (a)
                    return null;
                try {
                    let e = localStorage.getItem(s);
                    if (e) {
                        let t = JSON.parse(e);
                        if (t && "object" == typeof t)
                            return t
                    }
                } catch (e) {}
                return null
            }
            )()
              , [d,u] = (0,
            n.useState)(c)
              , [h,p] = (0,
            n.useState)(null !== c);
            (0,
            n.useEffect)( () => {
                if (a && !h)
                    try {
                        let e = localStorage.getItem(s);
                        if (e) {
                            let t = JSON.parse(e);
                            t && "object" == typeof t && u(t)
                        }
                    } catch (e) {} finally {
                        p(!0)
                    }
            }
            , [s, t, a, h]),
            (0,
            n.useEffect)( () => {
                if (!a || !h || !d)
                    return;
                let e = null
                  , t = null
                  , r = !1
                  , n = () => {
                    if (!r) {
                        if (!o.current) {
                            t = requestAnimationFrame(n);
                            return
                        }
                        e = window.setTimeout( () => {
                            if (!r && o.current)
                                try {
                                    o.current.setLayout(d)
                                } catch (e) {}
                        }
                        , 150)
                    }
                }
                ;
                return e = window.setTimeout( () => {
                    n()
                }
                , 100),
                () => {
                    r = !0,
                    null !== e && clearTimeout(e),
                    null !== t && cancelAnimationFrame(t)
                }
            }
            , [h, d, t, o, a]);
            let f = (0,
            n.useCallback)(e => {
                if (o.current && (!l || l(e)))
                    try {
                        localStorage.setItem(s, JSON.stringify(e))
                    } catch (e) {}
            }
            , [o, l, s]);
            return {
                groupRef: o,
                defaultLayout: a ? r : d || r,
                setLayout: f
            }
        }
    }
    ,
    87132: (e, t, r) => {
        "use strict";
        r.d(t, {
            A: () => l,
            b: () => s
        });
        var n = r(62546)
          , i = r(10584);
        let a = {
            chats: {},
            chatHistory: {},
            scrollPos: {},
            justStartedChats: [],
            highlightedChunks: {},
            input: {},
            isLoading: !1
        }
          , l = (0,
        i.Z0)({
            name: "chats",
            initialState: a,
            reducers: {
                addChats: (e, t) => {
                    n.Wp.objectEntries(t.payload).forEach(t => {
                        var r, n, i, a;
                        let[l,s] = t;
                        e.chats[l] = {
                            info: s,
                            isAiTyping: !1,
                            selectedChunkRef: void 0,
                            viewMode: "split"
                        },
                        null !== (i = (r = e.chatHistory)[l]) && void 0 !== i || (r[l] = {
                            messages: {}
                        }),
                        null !== (a = (n = e.input)[l]) && void 0 !== a || (n[l] = ""),
                        e.scrollPos[l] = {}
                    }
                    )
                }
                ,
                setInput: (e, t) => {
                    var r, n;
                    let {type: i, chatId: a, msg: l} = t.payload;
                    null !== (n = (r = e.input)[a]) && void 0 !== n || (r[a] = ""),
                    "set" == i ? e.input[a] = l : e.input[a] = e.input[a] + l
                }
                ,
                setViewMode: (e, t) => {
                    let {chatId: r, viewMode: n} = t.payload;
                    null != e.chats[r] && (e.chats[r].viewMode = n)
                }
                ,
                setAttachedImage: (e, t) => {
                    let {chatId: r, imgId: n, base64: i, width: a, height: l} = t.payload;
                    null != e.chats[r] && (e.chats[r].attachedImage = {
                        imgId: n,
                        base64: i,
                        width: a,
                        height: l
                    })
                }
                ,
                unsetAttachedImage: (e, t) => {
                    let {chatId: r} = t.payload;
                    null != e.chats[r] && (e.chats[r].attachedImage = void 0)
                }
                ,
                updateChatState: (e, t) => {
                    let {chatId: r, update: n} = t.payload;
                    null != e.chats[r] && (e.chats[r] = {
                        ...e.chats[r],
                        ...n
                    })
                }
                ,
                updateInfo: (e, t) => {
                    let {chatId: r, update: n} = t.payload;
                    null != e.chats[r].info && (e.chats[r].info = {
                        ...e.chats[r].info,
                        ...n
                    })
                }
                ,
                modifyHistory: (e, t) => {
                    var r, i;
                    let {chatId: a, toAdd: l, toUpsert: s, toRemove: o, toUpdate: c} = t.payload;
                    if (null != e.chatHistory[a]) {
                        for (let t of (null !== (i = (r = e.chatHistory)[a]) && void 0 !== i || (r[a] = {
                            messages: {}
                        }),
                        null != o ? o : []))
                            delete e.chatHistory[a].messages[t];
                        if (n.Wp.notEmpty(l))
                            for (let t of Object.values(l))
                                null == e.chatHistory[a].messages[t.id] && (e.chatHistory[a].messages[t.id] = t);
                        n.Wp.notEmpty(s) && (e.chatHistory[a].messages = {
                            ...e.chatHistory[a].messages,
                            ...s
                        }),
                        n.Wp.objectEntries(null != c ? c : {}).forEach(t => {
                            let[r,n] = t;
                            e.chatHistory[a].messages[r] = {
                                ...e.chatHistory[a].messages[r],
                                ...n
                            }
                        }
                        )
                    }
                }
                ,
                reset: () => a,
                resetChat: (e, t) => {
                    null != e.chatHistory[t.payload] && null != e.chats[t.payload] && (e.chatHistory[t.payload].messages = {},
                    e.chats[t.payload].info.lastMessage = "")
                }
                ,
                renameChat: (e, t) => {
                    let {chatId: r, newName: n} = t.payload;
                    null != e.chats[r] && (e.chats[r].info.displayName = n)
                }
                ,
                deleteChats: (e, t) => {
                    for (let r of t.payload)
                        delete e.chats[r],
                        delete e.chatHistory[r]
                }
                ,
                addJustStartedChat: (e, t) => {
                    e.justStartedChats.includes(t.payload) || e.justStartedChats.push(t.payload)
                }
                ,
                setIsLoading: (e, t) => {
                    e.isLoading = t.payload
                }
                ,
                setHighlightedChunks: (e, t) => {
                    null != e.highlightedChunks[t.payload.chatId] && (e.highlightedChunks[t.payload.chatId] = t.payload.chunks)
                }
                ,
                setViewedSource: (e, t) => {
                    let {chatId: r, src: n, pos: i} = t.payload;
                    if (null != e.chats[r] && (e.chats[r].sourceInViewer = n),
                    null != e.scrollPos[r]) {
                        var a, l, s;
                        null !== (l = (a = e.scrollPos)[r]) && void 0 !== l || (a[r] = {});
                        let t = null !== (s = e.scrollPos[r][n]) && void 0 !== s ? s : {
                            pageIndex: 0
                        };
                        e.scrollPos[r][n] = {
                            ...t,
                            ...i
                        }
                    }
                }
            }
        })
          , s = l.actions
    }
    ,
    55307: (e, t, r) => {
        "use strict";
        r.d(t, {
            S: () => s
        });
        var n = r(10584)
          , i = r(46333)
          , a = r(87212);
        let l = n.zD.withTypes();
        function s(e, t) {
            return l(e, async (e, n) => {
                try {
                    return await t(e, n)
                } catch (l) {
                    let {handleAllCpWebExceptionsThunk: e} = await Promise.all([r.e(2015), r.e(9553), r.e(6695), r.e(3322), r.e(6971), r.e(1874), r.e(8856), r.e(7676), r.e(1078), r.e(715), r.e(2555), r.e(2938)]).then(r.bind(r, 82938))
                      , t = function(e) {
                        if (console.log("tryExtractCpError_1", e),
                        e instanceof a.HN && (console.log("tryExtractCpError_2", e),
                        e.data && "object" == typeof e.data && null != e.data.cpError && (console.log("tryExtractCpError_3", e),
                        (0,
                        i.N)(e.data.cpError))))
                            return console.log("tryExtractCpError_4", e),
                            new i.l(e.data.cpError)
                    }(l);
                    if (console.log("createAppAsyncThunk_1", {
                        e: l,
                        cpError: t
                    }),
                    t)
                        throw n.dispatch(e({
                            shape: t.shape
                        })),
                        l;
                    throw l
                }
            }
            )
        }
    }
    ,
    68989: (e, t, r) => {
        "use strict";
        r.d(t, {
            G: () => a,
            j: () => i
        });
        var n = r(56863);
        let i = n.wA
          , a = n.d4
    }
    ,
    1405: (e, t, r) => {
        "use strict";
        r.d(t, {
            Gc: () => d,
            fb: () => o,
            oK: () => c,
            yh: () => s
        });
        var n = r(73060)
          , i = r(23908)
          , a = r(90583)
          , l = r(55307);
        let s = (0,
        l.S)("~prompts/fetchPromptsThunk", async (e, t) => {
            let {dispatch: r, getState: l} = t
              , s = (0,
            i.Vh)(l().account);
            if (!l().prompts.hasFetched || l().prompts.fetchedForUserId !== s) {
                r(n.d.setLoading(!0));
                try {
                    let e = await a.rP.prompt.list.query();
                    r(n.d.setPrompts({
                        prompts: e.prompts,
                        fetchedForUserId: s
                    }))
                } catch (e) {
                    console.error("[fetchPromptsThunk] Error fetching prompts:", e),
                    r(n.d.setPrompts({
                        prompts: [],
                        fetchedForUserId: s
                    }))
                } finally {
                    r(n.d.setLoading(!1))
                }
            }
        }
        )
          , o = (0,
        l.S)("~prompts/createPromptThunk", async (e, t) => {
            let {dispatch: r} = t
              , i = await a.rP.prompt.create.mutate({
                content: e.content
            });
            return r(n.d.upsertPrompt(i.prompt)),
            i.prompt
        }
        )
          , c = (0,
        l.S)("~prompts/updatePromptThunk", async (e, t) => {
            let {dispatch: r} = t
              , i = await a.rP.prompt.update.mutate({
                promptId: e.promptId,
                content: e.content
            });
            return r(n.d.upsertPrompt(i.prompt)),
            i.prompt
        }
        )
          , d = (0,
        l.S)("~prompts/deletePromptThunk", async (e, t) => {
            let {dispatch: r} = t;
            r(n.d.deletePrompt(e.promptId)),
            await a.rP.prompt.delete.mutate({
                promptId: e.promptId
            })
        }
        )
    }
    ,
    95516: (e, t, r) => {
        "use strict";
        r.d(t, {
            W_: () => s,
            Xm: () => o,
            e5: () => c,
            il: () => a
        });
        var n = r(10584)
          , i = r(14460)
          , a = function(e) {
            return e.Open = "open",
            e.Closed = "closed",
            e.Initial = "initial",
            e
        }({});
        let l = {
            isActive: !1,
            isFinished: !1,
            area: {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            }
        }
          , s = () => ({
            isMobile: !1,
            hasRunMobileCheck: !1,
            siderStatus: "initial",
            visionSelect: l,
            premiumModelSelected: !1,
            expandedCollectionChatId: null,
            reopenSavedPromptsPopover: void 0,
            landingActiveLauncherTab: "chat",
            modalActiveLauncherTab: "chat",
            isProcessingFlashcards: !1,
            isProcessingSlides: !1
        })
          , o = (0,
        n.Z0)({
            name: "ui",
            initialState: s(),
            reducers: {
                setIsMobile: (e, t) => {
                    e.isMobile = t.payload,
                    e.hasRunMobileCheck = !0
                }
                ,
                setSiderStatus: (e, t) => {
                    console.log("[uiSlice] setSiderStatus called:", t.payload),
                    e.siderStatus = t.payload,
                    e.isMobile && "closed" === e.siderStatus && (e.siderStatus = "initial"),
                    e.isMobile || "open" !== e.siderStatus || (e.siderStatus = "initial"),
                    console.log("[uiSlice] setSiderStatus after:", e.siderStatus)
                }
                ,
                setVisionSelectActive: (e, t) => {
                    e.visionSelect.isActive = t.payload
                }
                ,
                setVisionSelectFinished: (e, t) => {
                    e.visionSelect.isFinished = t.payload
                }
                ,
                resetVisionSelect: e => {
                    e.visionSelect.isActive = !1,
                    e.visionSelect.isFinished = !1,
                    e.visionSelect.area = {
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0
                    }
                }
                ,
                setVisionSelectArea: (e, t) => {
                    e.visionSelect.area = t.payload
                }
                ,
                setPremiumModelSelected: (e, t) => {
                    e.premiumModelSelected = t.payload
                }
                ,
                setExpandedCollectionChatId: (e, t) => {
                    e.expandedCollectionChatId = t.payload,
                    (0,
                    i.c0)(t.payload)
                }
                ,
                requestReopenSavedPromptsPopover: (e, t) => {
                    e.reopenSavedPromptsPopover = {
                        chatId: t.payload,
                        nonce: Date.now()
                    }
                }
                ,
                clearReopenSavedPromptsPopover: e => {
                    e.reopenSavedPromptsPopover = void 0
                }
                ,
                toggleExpandedCollectionChatId: (e, t) => {
                    e.expandedCollectionChatId = e.expandedCollectionChatId === t.payload ? null : t.payload,
                    (0,
                    i.c0)(e.expandedCollectionChatId)
                }
                ,
                setLandingActiveLauncherTab: (e, t) => {
                    e.landingActiveLauncherTab = t.payload
                }
                ,
                setModalActiveLauncherTab: (e, t) => {
                    e.modalActiveLauncherTab = t.payload
                }
                ,
                setIsProcessingFlashcards: (e, t) => {
                    e.isProcessingFlashcards = t.payload
                }
                ,
                setIsProcessingSlides: (e, t) => {
                    e.isProcessingSlides = t.payload
                }
            }
        })
          , c = o.actions
    }
    ,
    50575: (e, t, r) => {
        "use strict";
        r.d(t, {
            c: () => c,
            d: () => o
        });
        var n = r(47486)
          , i = r(87132)
          , a = r(55307)
          , l = r(95516);
        let s = (0,
        a.S)("~ui/goToPageThunk", async (e, t) => {
            let {extra: r} = t;
            e.replace ? r.router.replace(e.pathname, e.options) : r.router.push(e.pathname, e.options)
        }
        );
        function o(e, t) {
            let r = null == t ? void 0 : t.replace;
            if ("/" === e) {
                if ((0,
                n.Iz)())
                    return s({
                        pathname: "/application/desktop",
                        options: t,
                        replace: r
                    });
                if ((0,
                n.YF)())
                    return s({
                        pathname: "/application/mobile",
                        options: t,
                        replace: r
                    })
            }
            return s({
                pathname: e,
                options: t,
                replace: r
            })
        }
        let c = (0,
        a.S)("~ui/setSiderStatusThunk", async (e, t) => {
            let {dispatch: r, getState: n} = t
              , {status: a, chatId: s} = e
              , o = n().ui.isMobile;
            r(l.e5.setSiderStatus(a)),
            o && a === l.il.Open && null != s && r(i.b.setViewMode({
                chatId: s,
                viewMode: "chat"
            }))
        }
        )
    }
    ,
    97715: (e, t, r) => {
        "use strict";
        r.d(t, {
            K: () => l
        });
        var n = r(4430)
          , i = r(39789)
          , a = r(90421);
        class l {
            chooseCodec() {
                if ((0,
                a.UV)()) {
                    let e = 'audio/mp4; codecs="opus"';
                    return window.MediaSource && MediaSource.isTypeSupported(e) ? e : ""
                }
                return "audio/mpeg"
            }
            startStreaming(e) {
                this.stopStreaming(),
                this.onStatusChange("loading");
                let t = new AbortController;
                this.abortControllerRef = t;
                let r = document.createElement("audio");
                this.audioRef = r,
                document.body.appendChild(r),
                r.addEventListener("ended", () => {
                    this.stopStreaming()
                }
                );
                let i = {
                    input: e.replace(/\s*\[T(\d+)\]/g, "").replace(/\s\[R(\d+)\]/g, "")
                }
                  , a = this.chooseCodec()
                  , l = (0,
                n.e9)(n.QQ.streamingTts) + (a ? "?codec=".concat(encodeURIComponent(a.includes("opus") ? "opus" : "mp3")) : "");
                if (!a) {
                    this.handleDirectPlayback(l, i, t);
                    return
                }
                this.handleMseStreaming(l, i, a, t)
            }
            handleDirectPlayback(e, t, r) {
                if (!this.audioRef)
                    return;
                let n = this.audioRef;
                (async () => {
                    try {
                        let a = await fetch(e, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(t),
                            signal: r.signal
                        });
                        if (!a.ok) {
                            let e = await a.text();
                            throw Error("Network response was not ok: ".concat(a.status, " - ").concat(e))
                        }
                        let l = await a.blob();
                        n.src = URL.createObjectURL(l),
                        this.onStatusChange("playing"),
                        n.play().catch(e => {
                            console.error("Error playing audio:", e),
                            (0,
                            i.Ni)("Could not play audio. Try tapping the screen first."),
                            this.stopStreaming()
                        }
                        )
                    } catch (e) {
                        if ("AbortError" === e.name)
                            ;
                        else {
                            var a;
                            console.error("Error during audio fetch:", e),
                            (0,
                            i.Ni)("There was an error playing the audio"),
                            null === (a = this.onError) || void 0 === a || a.call(this, e)
                        }
                        this.onStatusChange("idle")
                    }
                }
                )()
            }
            handleMseStreaming(e, t, r, n) {
                if (!this.audioRef)
                    return;
                let a = this.audioRef
                  , l = new MediaSource;
                a.src = URL.createObjectURL(l),
                l.addEventListener("sourceopen", async () => {
                    if (!MediaSource.isTypeSupported(r)) {
                        console.error("MIME type ".concat(r, " is not supported on your browser.")),
                        (0,
                        i.Ni)("Sorry, your browser does not support this feature."),
                        this.onStatusChange("idle");
                        return
                    }
                    try {
                        let a = l.addSourceBuffer(r)
                          , s = await fetch(e, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(t),
                            signal: n.signal
                        });
                        if (!s.ok || !s.body) {
                            let e = await s.text();
                            throw Error("Network response was not ok: ".concat(s.status, " - ").concat(e))
                        }
                        let o = s.body.getReader()
                          , c = !0
                          , d = () => new Promise(e => {
                            a.updating ? a.addEventListener("updateend", () => e(), {
                                once: !0
                            }) : e()
                        }
                        )
                          , u = async () => {
                            try {
                                let {done: e, value: t} = await o.read();
                                if (e) {
                                    l.endOfStream();
                                    return
                                }
                                if (!this.audioRef || (c && (c = !1,
                                this.onStatusChange("playing")),
                                await d(),
                                a.appendBuffer(t),
                                await d(),
                                !this.audioRef))
                                    return;
                                u()
                            } catch (t) {
                                if ("AbortError" === t.name)
                                    ;
                                else {
                                    var e;
                                    console.error("Error during streaming pump:", t),
                                    (0,
                                    i.Ni)("There was an error playing the audio"),
                                    null === (e = this.onError) || void 0 === e || e.call(this, t)
                                }
                                this.onStatusChange("idle")
                            }
                        }
                        ;
                        u()
                    } catch (e) {
                        if ("AbortError" === e.name)
                            ;
                        else {
                            var a;
                            console.error("Error during streaming fetch:", e),
                            (0,
                            i.Ni)("There was an error playing the audio"),
                            null === (a = this.onError) || void 0 === a || a.call(this, e)
                        }
                        this.onStatusChange("idle")
                    }
                }
                ),
                a.play().catch(e => {
                    console.error("Error playing audio:", e),
                    this.onStatusChange("idle")
                }
                )
            }
            stopStreaming() {
                this.abortControllerRef && (this.abortControllerRef.abort(),
                this.abortControllerRef = null),
                this.audioRef && (this.audioRef.pause(),
                this.audioRef.src && URL.revokeObjectURL(this.audioRef.src),
                this.audioRef.parentNode && this.audioRef.parentNode.removeChild(this.audioRef),
                this.audioRef.src = "",
                this.audioRef = null),
                this.onStatusChange("idle")
            }
            constructor(e) {
                this.audioRef = null,
                this.abortControllerRef = null,
                this.onStatusChange = e.onStatusChange,
                this.onError = e.onError
            }
        }
    }
    ,
    90421: (e, t, r) => {
        "use strict";
        r.d(t, {
            CN: () => s,
            F2: () => i,
            U0: () => d,
            UV: () => o,
            al: () => l,
            e2: () => p,
            fZ: () => a,
            iv: () => h,
            m0: () => c,
            uF: () => u
        });
        var n = r(68989);
        let i = () => !!window.document && !!window.document.createElement
          , a = () => !!i() && window.matchMedia("only screen and (max-width: 560px)").matches
          , l = () => (0,
        n.G)(e => e.ui.isMobile)
          , s = () => "undefined" != typeof document && "ontouchend"in document
          , o = () => ["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"].includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend"in document
          , c = () => navigator.userAgent.includes("Android")
          , d = () => "undefined" != typeof navigator && navigator.platform.toUpperCase().indexOf("MAC") >= 0
          , u = () => "undefined" != typeof navigator && navigator.platform.toUpperCase().indexOf("WIN") >= 0
          , h = () => !(navigator.userAgent.includes("Instagram") || navigator.userAgent.includes("FBAN") || navigator.userAgent.includes("FBAV") || navigator.userAgent.includes("ByteLo"))
          , p = e => {
            null == window.open(e, "_blank") && (window.location.href = e)
        }
    }
    ,
    86515: (e, t, r) => {
        "use strict";
        async function n(e) {
            let t = new Map
              , r = e => {
                let r = e.webkitRelativePath || "".concat(e.name, "_").concat(e.size, "_").concat(e.lastModified);
                t.has(r) || t.set(r, e)
            }
              , n = e => new Promise( (t, r) => e.file(t, r))
              , i = async e => {
                if (e.isFile)
                    r(await n(e));
                else if (e.isDirectory) {
                    let t = e.createReader();
                    for (; ; ) {
                        let e = await new Promise( (e, r) => t.readEntries(e, r));
                        if (!e.length)
                            break;
                        for (let t of e)
                            await i(t)
                    }
                }
            }
            ;
            if (Array.from(e.items).some(e => {
                var t, r, n, i;
                let a = null !== (i = null !== (n = null === (t = e.webkitGetAsEntry) || void 0 === t ? void 0 : t.call(e)) && void 0 !== n ? n : null === (r = e.getAsEntry) || void 0 === r ? void 0 : r.call(e)) && void 0 !== i ? i : null;
                return a && a.isDirectory
            }
            ))
                for (let t of Array.from(e.items)) {
                    var a, l, s, o;
                    let e = null !== (o = null !== (s = null === (a = t.webkitGetAsEntry) || void 0 === a ? void 0 : a.call(t)) && void 0 !== s ? s : null === (l = t.getAsEntry) || void 0 === l ? void 0 : l.call(t)) && void 0 !== o ? o : null;
                    if (e)
                        await i(e);
                    else {
                        let e = t.getAsFile();
                        e && r(e)
                    }
                }
            else if (e.files && e.files.length > 0)
                for (let t of Array.from(e.files))
                    r(t);
            else
                for (let t of Array.from(e.items)) {
                    let e = t.getAsFile();
                    e && r(e)
                }
            return Array.from(t.values())
        }
        function i(e) {
            let t = new Uint8Array([37, 80, 68, 70]);
            return e.length >= 4 && e[0] === t[0] && e[1] === t[1] && e[2] === t[2] && e[3] === t[3]
        }
        function a(e, t) {
            return new File([new Blob([e],{
                type: "text/plain"
            })],t,{
                type: "text/plain"
            })
        }
        r.d(t, {
            D3: () => a,
            Pi: () => i,
            h9: () => n
        })
    }
    ,
    76412: (e, t, r) => {
        "use strict";
        r.d(t, {
            Bb: () => n,
            Hk: () => i,
            zI: () => a
        });
        let n = async function(e, t) {
            let r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 1
              , n = document.createElement("canvas")
              , i = n.getContext("2d");
            if (!i)
                throw Error("Could not get 2d context");
            let a = e.width
              , l = e.height;
            return a > l ? a > t && (l = Math.round(t * l / a),
            a = t) : l > t && (a = Math.round(t * a / l),
            l = t),
            n.width = a,
            n.height = l,
            i.drawImage(e, 0, 0, a, l),
            {
                base64: n.toDataURL("image/png", r),
                width: a,
                height: l
            }
        }
          , i = e => {
            let t = document.createElement("canvas");
            t.width = e.naturalWidth,
            t.height = e.naturalHeight;
            let r = t.getContext("2d");
            return null == r || r.drawImage(e, 0, 0),
            t.toDataURL("image/png")
        }
          , a = async (e, t, r) => {
            let n = e.cloneNode(!0)
              , i = n.getAttribute("viewBox");
            if (n.setAttribute("width", t.toString()),
            n.setAttribute("height", r.toString()),
            !i) {
                let e = n.getBBox ? n.getBBox() : {
                    x: 0,
                    y: 0,
                    width: t,
                    height: r
                }
                  , i = "".concat(e.x || 0, " ").concat(e.y || 0, " ").concat(e.width || t, " ").concat(e.height || r);
                n.setAttribute("viewBox", i)
            }
            n.setAttribute("preserveAspectRatio", "xMidYMid meet");
            let a = new XMLSerializer().serializeToString(n)
              , l = document.createElement("canvas");
            l.width = 4 * t,
            l.height = 4 * r;
            let s = l.getContext("2d", {
                alpha: !0
            })
              , o = new Blob([a],{
                type: "image/svg+xml;charset=utf-8"
            })
              , c = URL.createObjectURL(o);
            try {
                return await new Promise( (e, t) => {
                    let r = new Image;
                    r.onerror = () => {
                        t(Error("Failed to load SVG image"))
                    }
                    ,
                    r.onload = () => {
                        if (!s) {
                            t(Error("Could not get canvas context"));
                            return
                        }
                        s.clearRect(0, 0, l.width, l.height),
                        s.imageSmoothingEnabled = !0,
                        s.imageSmoothingQuality = "high",
                        s.drawImage(r, 0, 0, l.width, l.height);
                        let n = l.toDataURL("image/png", 1);
                        e(n)
                    }
                    ,
                    r.src = c
                }
                )
            } finally {
                URL.revokeObjectURL(c)
            }
        }
    }
    ,
    70278: (e, t, r) => {
        "use strict";
        r.d(t, {
            M: () => n
        });
        let n = {}
    }
    ,
    24248: (e, t, r) => {
        "use strict";
        r.d(t, {
            H: () => n,
            b: () => i
        });
        let n = (e, t, r, n) => {
            var i, a;
            let l = null !== (i = null == n ? void 0 : n.maxAttempts) && void 0 !== i ? i : 15
              , s = null !== (a = null == n ? void 0 : n.interval) && void 0 !== a ? a : 100
              , o = 0
              , c = () => {
                let n = document.querySelector(e);
                if (!n) {
                    ++o < l && requestAnimationFrame( () => setTimeout(c, s));
                    return
                }
                n.scrollWidth > n.clientWidth && Math.abs(n.scrollLeft - t) > 1 && (n.scrollLeft = t),
                n.scrollHeight > n.clientHeight && Math.abs(n.scrollTop - r) > 1 && (n.scrollTop = r);
                let i = 1 >= Math.abs(n.scrollLeft - t)
                  , a = 1 >= Math.abs(n.scrollTop - r);
                o++,
                (!i || !a || o < 5) && o < l && requestAnimationFrame( () => setTimeout(c, s))
            }
            ;
            c()
        }
          , i = function(e, t) {
            let r = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 16
              , n = e.getBoundingClientRect()
              , i = t.getBoundingClientRect()
              , l = i.top < n.top
              , s = i.bottom > n.top + e.clientHeight;
            if (l || s) {
                let t = l ? i.top + e.scrollTop - n.top - r : i.top + e.scrollTop - n.top - e.clientHeight + i.height + r;
                a(e.scrollTop, t, 500, t => e.scrollTop = t)
            }
        }
          , a = (e, t, r, n) => {
            let i = Date.now()
              , a = () => {
                let l = Date.now();
                n(function(e, t, r, n) {
                    return -r * (Math.pow((e /= n) - 1, 4) - 1) + t
                }(l - i, e, t - e, r)),
                l <= i + r && requestAnimationFrame(a)
            }
            ;
            requestAnimationFrame(a)
        }
    }
    ,
    98392: (e, t, r) => {
        "use strict";
        r.d(t, {
            Sn: () => n,
            W5: () => a,
            rj: () => i
        });
        let n = e => e.replace(/\w\S*/g, e => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase())
          , i = e => "undefined" != typeof Intl && "function" == typeof Intl.Segmenter ? Array.from(new Intl.Segmenter(void 0,{
            granularity: "word"
        }).segment(e)).filter(e => e.isWordLike).length : /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af\u0e00-\u0e7f]/.test(e) ? e.split("").filter(e => e.trim().length > 0).length : e.trim().split(/\s+/).filter(Boolean).length
          , a = (e, t) => e.length > t ? e.slice(0, t) + "…" : e
    }
    ,
    39789: (e, t, r) => {
        "use strict";
        r.d(t, {
            $S: () => o,
            GF: () => l,
            Ni: () => a,
            rQ: () => s
        });
        var n = r(45529);
        let i = {
            className: "!w-fit !max-w-[90vw] sm:!max-w-[400px]",
            duration: 5e3
        }
          , a = e => {
            n.oR.error(e, i)
        }
          , l = e => {
            n.oR.success(e, i)
        }
          , s = e => {
            n.oR.warning(e, i)
        }
          , o = e => {
            n.oR.info(e, i)
        }
    }
    ,
    4186: (e, t, r) => {
        "use strict";
        r.d(t, {
            f: () => i
        });
        var n = r(78968);
        let i = function(e) {
            let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}
              , {disabled: r=!1, onPasteUrl: i} = t;
            (0,
            n.useEffect)( () => {
                if (r)
                    return;
                let t = e.current;
                if (!t)
                    return;
                let n = e => {
                    var r;
                    e.metaKey || e.ctrlKey || e.altKey || "Meta" === e.key || "Control" === e.key || "Alt" === e.key || "Shift" === e.key || (null === (r = document.activeElement) || void 0 === r ? void 0 : r.matches("input, textarea, [contenteditable]")) || t.focus()
                }
                  , a = e => {
                    var r;
                    if (!(null === (r = document.activeElement) || void 0 === r ? void 0 : r.matches("input, textarea, [contenteditable]")) && (t.focus(),
                    i)) {
                        let t = e.clipboardData;
                        if (t) {
                            let r = t.getData("text");
                            if (r)
                                try {
                                    let t = r.trim()
                                      , n = new URL(t);
                                    ("http:" === n.protocol || "https:" === n.protocol) && (e.preventDefault(),
                                    i(t))
                                } catch (e) {}
                        }
                    }
                }
                ;
                return document.addEventListener("keydown", n),
                document.addEventListener("paste", a),
                () => {
                    document.removeEventListener("keydown", n),
                    document.removeEventListener("paste", a)
                }
            }
            , [r, e, i])
        }
    }
    ,
    81822: () => {}
    ,
    53134: () => {}
    ,
    30924: e => {
        e.exports = {
            clickDrag: "clickDrag_clickDrag__9vOSo",
            clickDragHidden: "clickDrag_clickDragHidden__O5Ua9"
        }
    }
    ,
    49164: e => {
        e.exports = {
            selectedText: "selectedText_selectedText__j73DL",
            selectedEnd: "selectedText_selectedEnd__Hu2OV"
        }
    }
    ,
    46333: (e, t, r) => {
        "use strict";
        r.d(t, {
            l: () => n,
            N: () => i
        });
        class n extends Error {
            constructor(e, t) {
                super(null != t ? t : JSON.stringify(e)),
                this.shape = e
            }
        }
        function i(e) {
            return "limitException" === e.type || "sourceMissingException" === e.type || "sourceParseException" === e.type || "urlFetchException" === e.type || "youtubeNoTranscriptException" === e.type || "unknownError" === e.type || "urlFetchException" === e.type
        }
    }
}, e => {
    var t = t => e(e.s = t);
    e.O(0, [2326, 2015, 7324, 2778, 951, 2848, 690, 6258, 3564, 1336, 868, 4356, 6294, 9646, 1279, 6863, 2496, 9553, 6695, 3322, 531, 6971, 1874, 4002, 1474, 7774, 7927, 3109, 4199, 2546, 2555, 7531, 8948, 2719, 7358], () => t(23709)),
    _N_E = e.O()
}
]);
