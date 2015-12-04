"use strict";

var Chess = function(r) {
	function e() {
		fr = new Array(128), ar = {
			w: Q,
			b: Q
		}, ur = K, lr = {
			w: 0,
			b: 0
		}, sr = Q, pr = 0, cr = 1, vr = [], gr = {}, a(i())
	}

	function n() {
		t(F)
	}

	function t(r) {
		var n = r.split(/\s+/),
			t = n[0],
			f = 0;
		if (!o(r)
			.valid) return !1;
		e();
		for (var u = 0; u < t.length; u++) {
			var s = t.charAt(u);
			if ("/" === s) f += 8;
			else if (R(s)) f += parseInt(s, 10);
			else {
				var p = "a" > s ? K : q;
				l({
					type: s.toLowerCase(),
					color: p
				}, w(f)), f++
			}
		}
		return ur = n[1], n[2].indexOf("K") > -1 && (lr.w |= Y.KSIDE_CASTLE), n[2].indexOf("Q") > -1 && (lr.w |= Y.QSIDE_CASTLE), n[2].indexOf("k") > -1 && (lr.b |= Y.KSIDE_CASTLE), n[2].indexOf("q") > -1 && (lr.b |= Y.QSIDE_CASTLE), sr = "-" === n[3] ? Q : or[n[3]], pr = parseInt(n[4], 10), cr = parseInt(n[5], 10), a(i()), !0
	}

	function o(r) {
		var e = {
				0: "No errors.",
				1: "FEN string must contain six space-delimited fields.",
				2: "6th field (move number) must be a positive integer.",
				3: "5th field (half move counter) must be a non-negative integer.",
				4: "4th field (en-passant square) is invalid.",
				5: "3rd field (castling availability) is invalid.",
				6: "2nd field (side to move) is invalid.",
				7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
				8: "1st field (piece positions) is invalid [consecutive numbers].",
				9: "1st field (piece positions) is invalid [invalid piece].",
				10: "1st field (piece positions) is invalid [row too large]."
			},
			n = r.split(/\s+/);
		if (6 !== n.length) return {
			valid: !1,
			error_number: 1,
			error: e[1]
		};
		if (isNaN(n[5]) || parseInt(n[5], 10) <= 0) return {
			valid: !1,
			error_number: 2,
			error: e[2]
		};
		if (isNaN(n[4]) || parseInt(n[4], 10) < 0) return {
			valid: !1,
			error_number: 3,
			error: e[3]
		};
		if (!/^(-|[abcdefgh][36])$/.test(n[3])) return {
			valid: !1,
			error_number: 4,
			error: e[4]
		};
		if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(n[2])) return {
			valid: !1,
			error_number: 5,
			error: e[5]
		};
		if (!/^(w|b)$/.test(n[1])) return {
			valid: !1,
			error_number: 6,
			error: e[6]
		};
		var t = n[0].split("/");
		if (8 !== t.length) return {
			valid: !1,
			error_number: 7,
			error: e[7]
		};
		for (var o = 0; o < t.length; o++) {
			for (var i = 0, f = !1, a = 0; a < t[o].length; a++)
				if (isNaN(t[o][a])) {
					if (!/^[prnbqkPRNBQK]$/.test(t[o][a])) return {
						valid: !1,
						error_number: 9,
						error: e[9]
					};
					i += 1, f = !1
				} else {
					if (f) return {
						valid: !1,
						error_number: 8,
						error: e[8]
					};
					i += parseInt(t[o][a], 10), f = !0
				}
			if (8 !== i) return {
				valid: !1,
				error_number: 10,
				error: e[10]
			}
		}
		return {
			valid: !0,
			error_number: 0,
			error: e[0]
		}
	}

	function i() {
		for (var r = 0, e = "", n = or.a8; n <= or.h1; n++) {
			if (null == fr[n]) r++;
			else {
				r > 0 && (e += r, r = 0);
				var t = fr[n].color,
					o = fr[n].type;
				e += t === K ? o.toUpperCase() : o.toLowerCase()
			}
			n + 1 & 136 && (r > 0 && (e += r), n !== or.h1 && (e += "/"), r = 0, n += 8)
		}
		var i = "";
		lr[K] & Y.KSIDE_CASTLE && (i += "K"), lr[K] & Y.QSIDE_CASTLE && (i += "Q"), lr[q] & Y.KSIDE_CASTLE && (i += "k"), lr[q] & Y.QSIDE_CASTLE && (i += "q"), i = i || "-";
		var f = sr === Q ? "-" : w(sr);
		return [e, ur, i, f, pr, cr].join(" ")
	}

	function f(r) {
		for (var e = 0; e < r.length; e += 2) "string" == typeof r[e] && "string" == typeof r[e + 1] && (gr[r[e]] = r[e + 1]);
		return gr
	}

	function a(r) {
		vr.length > 0 || (r !== F ? (gr.SetUp = "1", gr.FEN = r) : (delete gr.SetUp, delete gr.FEN))
	}

	function u(r) {
		var e = fr[or[r]];
		return e ? {
			type: e.type,
			color: e.color
		} : null
	}

	function l(r, e) {
		if (!("type" in r && "color" in r)) return !1;
		if (-1 === G.indexOf(r.type.toLowerCase())) return !1;
		if (!(e in or)) return !1;
		var n = or[e];
		return r.type == M && ar[r.color] != Q && ar[r.color] != n ? !1 : (fr[n] = {
			type: r.type,
			color: r.color
		}, r.type === M && (ar[r.color] = n), a(i()), !0)
	}

	function s(r) {
		var e = u(r);
		return fr[or[r]] = null, e && e.type === M && (ar[e.color] = Q), a(i()), e
	}

	function p(r, e, n, t, o) {
		var i = {
			color: ur,
			from: e,
			to: n,
			flags: t,
			piece: r[e].type
		};
		return o && (i.flags |= Y.PROMOTION, i.promotion = o), r[n] ? i.captured = r[n].type : t & Y.EP_CAPTURE && (i.captured = U), i
	}

	function c(r) {
		function e(r, e, n, t, o) {
			if (r[n].type !== U || I(t) !== tr && I(t) !== rr) e.push(p(r, n, t, o));
			else
				for (var i = [B, j, $, x], f = 0, a = i.length; a > f; f++) e.push(p(r, n, t, o, i[f]))
		}
		var n = [],
			t = ur,
			o = L(t),
			i = {
				b: nr,
				w: er
			},
			f = or.a8,
			a = or.h1,
			u = !1,
			l = "undefined" != typeof r && "legal" in r ? r.legal : !0;
		if ("undefined" != typeof r && "square" in r) {
			if (!(r.square in or)) return [];
			f = a = or[r.square], u = !0
		}
		for (var s = f; a >= s; s++)
			if (136 & s) s += 7;
			else {
				var c = fr[s];
				if (null != c && c.color === t)
					if (c.type === U) {
						var v = s + H[t][0];
						if (null == fr[v]) {
							e(fr, n, s, v, Y.NORMAL);
							var v = s + H[t][1];
							i[t] === I(s) && null == fr[v] && e(fr, n, s, v, Y.BIG_PAWN)
						}
						for (E = 2; 4 > E; E++) {
							var v = s + H[t][E];
							136 & v || (null != fr[v] && fr[v].color === o ? e(fr, n, s, v, Y.CAPTURE) : v === sr && e(fr, n, s, sr, Y.EP_CAPTURE))
						}
					} else
						for (var E = 0, d = Z[c.type].length; d > E; E++)
							for (var b = Z[c.type][E], v = s;;) {
								if (v += b, 136 & v) break;
								if (null != fr[v]) {
									if (fr[v].color === t) break;
									e(fr, n, s, v, Y.CAPTURE);
									break
								}
								if (e(fr, n, s, v, Y.NORMAL), "n" === c.type || "k" === c.type) break
							}
			}
		if (!u || a === ar[t]) {
			if (lr[t] & Y.KSIDE_CASTLE) {
				var _ = ar[t],
					A = _ + 2;
				null != fr[_ + 1] || null != fr[A] || g(o, ar[t]) || g(o, _ + 1) || g(o, A) || e(fr, n, ar[t], A, Y.KSIDE_CASTLE)
			}
			if (lr[t] & Y.QSIDE_CASTLE) {
				var _ = ar[t],
					A = _ - 2;
				null != fr[_ - 1] || null != fr[_ - 2] || null != fr[_ - 3] || g(o, ar[t]) || g(o, _ - 1) || g(o, A) || e(fr, n, ar[t], A, Y.QSIDE_CASTLE)
			}
		}
		if (!l) return n;
		for (var S = [], s = 0, d = n.length; d > s; s++) y(n[s]), h(t) || S.push(n[s]), m();
		return S
	}

	function v(r) {
		var e = "";
		if (r.flags & Y.KSIDE_CASTLE) e = "O-O";
		else if (r.flags & Y.QSIDE_CASTLE) e = "O-O-O";
		else {
			var n = C(r);
			r.piece !== U && (e += r.piece.toUpperCase() + n), r.flags & (Y.CAPTURE | Y.EP_CAPTURE) && (r.piece === U && (e += w(r.from)[0]), e += "x"), e += w(r.to), r.flags & Y.PROMOTION && (e += "=" + r.promotion.toUpperCase())
		}
		return y(r), E() && (e += d() ? "#" : "+"), m(), e
	}

	function g(r, e) {
		for (var n = or.a8; n <= or.h1; n++)
			if (136 & n) n += 7;
			else if (null != fr[n] && fr[n].color === r) {
			var t = fr[n],
				o = n - e,
				i = o + 119;
			if (z[i] & 1 << V[t.type]) {
				if (t.type === U) {
					if (o > 0) {
						if (t.color === K) return !0
					} else if (t.color === q) return !0;
					continue
				}
				if ("n" === t.type || "k" === t.type) return !0;
				for (var f = J[i], a = n + f, u = !1; a !== e;) {
					if (null != fr[a]) {
						u = !0;
						break
					}
					a += f
				}
				if (!u) return !0
			}
		}
		return !1
	}

	function h(r) {
		return g(L(r), ar[r])
	}

	function E() {
		return h(ur)
	}

	function d() {
		return E() && 0 === c()
			.length
	}

	function b() {
		return !E() && 0 === c()
			.length
	}

	function _() {
		for (var r = {}, e = [], n = 0, t = 0, o = or.a8; o <= or.h1; o++)
			if (t = (t + 1) % 2, 136 & o) o += 7;
			else {
				var i = fr[o];
				i && (r[i.type] = i.type in r ? r[i.type] + 1 : 1, i.type === $ && e.push(t), n++)
			}
		if (2 === n) return !0;
		if (3 === n && (1 === r[$] || 1 === r[x])) return !0;
		if (n === r[$] + 2) {
			for (var f = 0, a = e.length, o = 0; a > o; o++) f += e[o];
			if (0 === f || f === a) return !0
		}
		return !1
	}

	function A() {
		for (var r = [], e = {}, n = !1;;) {
			var t = m();
			if (!t) break;
			r.push(t)
		}
		for (;;) {
			var o = i()
				.split(" ")
				.slice(0, 4)
				.join(" ");
			if (e[o] = o in e ? e[o] + 1 : 1, e[o] >= 3 && (n = !0), !r.length) break;
			y(r.pop())
		}
		return n
	}

	function S(r) {
		vr.push({
			move: r,
			kings: {
				b: ar.b,
				w: ar.w
			},
			turn: ur,
			castling: {
				b: lr.b,
				w: lr.w
			},
			ep_square: sr,
			half_moves: pr,
			move_number: cr
		})
	}

	function y(r) {
		var e = ur,
			n = L(e);
		if (S(r), fr[r.to] = fr[r.from], fr[r.from] = null, r.flags & Y.EP_CAPTURE && (ur === q ? fr[r.to - 16] = null : fr[r.to + 16] = null), r.flags & Y.PROMOTION && (fr[r.to] = {
				type: r.promotion,
				color: e
			}), fr[r.to].type === M) {
			if (ar[fr[r.to].color] = r.to, r.flags & Y.KSIDE_CASTLE) {
				var t = r.to - 1,
					o = r.to + 1;
				fr[t] = fr[o], fr[o] = null
			} else if (r.flags & Y.QSIDE_CASTLE) {
				var t = r.to + 1,
					o = r.to - 2;
				fr[t] = fr[o], fr[o] = null
			}
			lr[e] = ""
		}
		if (lr[e])
			for (var i = 0, f = ir[e].length; f > i; i++)
				if (r.from === ir[e][i].square && lr[e] & ir[e][i].flag) {
					lr[e] ^= ir[e][i].flag;
					break
				}
		if (lr[n])
			for (var i = 0, f = ir[n].length; f > i; i++)
				if (r.to === ir[n][i].square && lr[n] & ir[n][i].flag) {
					lr[n] ^= ir[n][i].flag;
					break
				}
		sr = r.flags & Y.BIG_PAWN ? "b" === ur ? r.to - 16 : r.to + 16 : Q, r.piece === U ? pr = 0 : r.flags & (Y.CAPTURE | Y.EP_CAPTURE) ? pr = 0 : pr++, ur === q && cr++, ur = L(ur)
	}

	function m() {
		var r = vr.pop();
		if (null == r) return null;
		var e = r.move;
		ar = r.kings, ur = r.turn, lr = r.castling, sr = r.ep_square, pr = r.half_moves, cr = r.move_number;
		var n = ur,
			t = L(ur);
		if (fr[e.from] = fr[e.to], fr[e.from].type = e.piece, fr[e.to] = null, e.flags & Y.CAPTURE) fr[e.to] = {
			type: e.captured,
			color: t
		};
		else if (e.flags & Y.EP_CAPTURE) {
			var o;
			o = n === q ? e.to - 16 : e.to + 16, fr[o] = {
				type: U,
				color: t
			}
		}
		if (e.flags & (Y.KSIDE_CASTLE | Y.QSIDE_CASTLE)) {
			var i, f;
			e.flags & Y.KSIDE_CASTLE ? (i = e.to + 1, f = e.to - 1) : e.flags & Y.QSIDE_CASTLE && (i = e.to - 2, f = e.to + 1), fr[i] = fr[f], fr[f] = null
		}
		return e
	}

	function C(r) {
		for (var e = c(), n = r.from, t = r.to, o = r.piece, i = 0, f = 0, a = 0, u = 0, l = e.length; l > u; u++) {
			var s = e[u].from,
				p = e[u].to,
				v = e[u].piece;
			o === v && n !== s && t === p && (i++, I(n) === I(s) && f++, P(n) === P(s) && a++)
		}
		return i > 0 ? f > 0 && a > 0 ? w(n) : w(n)
			.charAt(a > 0 ? 1 : 0) : ""
	}

	function T() {
		for (var r = "   +------------------------+\n", e = or.a8; e <= or.h1; e++) {
			if (0 === P(e) && (r += " " + "87654321" [I(e)] + " |"), null == fr[e]) r += " . ";
			else {
				var n = fr[e].type,
					t = fr[e].color,
					o = t === K ? n.toUpperCase() : n.toLowerCase();
				r += " " + o + " "
			}
			e + 1 & 136 && (r += "|\n", e += 8)
		}
		return r += "   +------------------------+\n", r += "     a  b  c  d  e  f  g  h\n"
	}

	function I(r) {
		return r >> 4
	}

	function P(r) {
		return 15 & r
	}

	function w(r) {
		var e = P(r),
			n = I(r);
		return "abcdefgh".substring(e, e + 1) + "87654321".substring(n, n + 1)
	}

	function L(r) {
		return r === K ? q : K
	}

	function R(r) {
		return -1 !== "0123456789".indexOf(r)
	}

	function O(r) {
		var e = N(r);
		e.san = v(e), e.to = w(e.to), e.from = w(e.from);
		var n = "";
		for (var t in Y) Y[t] & e.flags && (n += X[t]);
		return e.flags = n, e
	}

	function N(r) {
		var e = r instanceof Array ? [] : {};
		for (var n in r) "object" == typeof n ? e[n] = N(r[n]) : e[n] = r[n];
		return e
	}

	function k(r) {
		return r.replace(/^\s+|\s+$/g, "")
	}

	function D(r) {
		for (var e = c({
				legal: !1
			}), n = 0, t = ur, o = 0, i = e.length; i > o; o++) {
			if (y(e[o]), !h(t))
				if (r - 1 > 0) {
					var f = D(r - 1);
					n += f
				} else n++;
			m()
		}
		return n
	}
	var q = "b",
		K = "w",
		Q = -1,
		U = "p",
		x = "n",
		$ = "b",
		j = "r",
		B = "q",
		M = "k",
		G = "pnbrqkPNBRQK",
		F = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
		W = ["1-0", "0-1", "1/2-1/2", "*"],
		H = {
			b: [16, 32, 17, 15],
			w: [-16, -32, -17, -15]
		},
		Z = {
			n: [-18, -33, -31, -14, 18, 33, 31, 14],
			b: [-17, -15, 17, 15],
			r: [-16, 1, 16, -1],
			q: [-17, -16, -15, 1, 17, 16, 15, -1],
			k: [-17, -16, -15, 1, 17, 16, 15, -1]
		},
		z = [20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0, 24, 24, 24, 24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0, 0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20],
		J = [17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0, 0, 17, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0, -15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17],
		V = {
			p: 0,
			n: 1,
			b: 2,
			r: 3,
			q: 4,
			k: 5
		},
		X = {
			NORMAL: "n",
			CAPTURE: "c",
			BIG_PAWN: "b",
			EP_CAPTURE: "e",
			PROMOTION: "p",
			KSIDE_CASTLE: "k",
			QSIDE_CASTLE: "q"
		},
		Y = {
			NORMAL: 1,
			CAPTURE: 2,
			BIG_PAWN: 4,
			EP_CAPTURE: 8,
			PROMOTION: 16,
			KSIDE_CASTLE: 32,
			QSIDE_CASTLE: 64
		},
		rr = 7,
		er = 6,
		nr = 1,
		tr = 0,
		or = {
			a8: 0,
			b8: 1,
			c8: 2,
			d8: 3,
			e8: 4,
			f8: 5,
			g8: 6,
			h8: 7,
			a7: 16,
			b7: 17,
			c7: 18,
			d7: 19,
			e7: 20,
			f7: 21,
			g7: 22,
			h7: 23,
			a6: 32,
			b6: 33,
			c6: 34,
			d6: 35,
			e6: 36,
			f6: 37,
			g6: 38,
			h6: 39,
			a5: 48,
			b5: 49,
			c5: 50,
			d5: 51,
			e5: 52,
			f5: 53,
			g5: 54,
			h5: 55,
			a4: 64,
			b4: 65,
			c4: 66,
			d4: 67,
			e4: 68,
			f4: 69,
			g4: 70,
			h4: 71,
			a3: 80,
			b3: 81,
			c3: 82,
			d3: 83,
			e3: 84,
			f3: 85,
			g3: 86,
			h3: 87,
			a2: 96,
			b2: 97,
			c2: 98,
			d2: 99,
			e2: 100,
			f2: 101,
			g2: 102,
			h2: 103,
			a1: 112,
			b1: 113,
			c1: 114,
			d1: 115,
			e1: 116,
			f1: 117,
			g1: 118,
			h1: 119
		},
		ir = {
			w: [{
				square: or.a1,
				flag: Y.QSIDE_CASTLE
			}, {
				square: or.h1,
				flag: Y.KSIDE_CASTLE
			}],
			b: [{
				square: or.a8,
				flag: Y.QSIDE_CASTLE
			}, {
				square: or.h8,
				flag: Y.KSIDE_CASTLE
			}]
		},
		fr = new Array(128),
		ar = {
			w: Q,
			b: Q
		},
		ur = K,
		lr = {
			w: 0,
			b: 0
		},
		sr = Q,
		pr = 0,
		cr = 1,
		vr = [],
		gr = {};
	return t("undefined" == typeof r ? F : r), {
		WHITE: K,
		BLACK: q,
		PAWN: U,
		KNIGHT: x,
		BISHOP: $,
		ROOK: j,
		QUEEN: B,
		KING: M,
		SQUARES: function() {
			for (var r = [], e = or.a8; e <= or.h1; e++) 136 & e ? e += 7 : r.push(w(e));
			return r
		}(),
		FLAGS: X,
		load: function(r) {
			return t(r)
		},
		reset: function() {
			return n()
		},
		moves: function(r) {
			for (var e = c(r), n = [], t = 0, o = e.length; o > t; t++) n.push("undefined" != typeof r && "verbose" in r && r.verbose ? O(e[t]) : v(e[t]));
			return n
		},
		in_check: function() {
			return E()
		},
		in_checkmate: function() {
			return d()
		},
		in_stalemate: function() {
			return b()
		},
		in_draw: function() {
			return pr >= 100 || b() || _() || A()
		},
		insufficient_material: function() {
			return _()
		},
		in_threefold_repetition: function() {
			return A()
		},
		game_over: function() {
			return pr >= 100 || d() || b() || _() || A()
		},
		validate_fen: function(r) {
			return o(r)
		},
		fen: function() {
			return i()
		},
		pgn: function(r) {
			var e = "object" == typeof r && "string" == typeof r.newline_char ? r.newline_char : "\n",
				n = "object" == typeof r && "number" == typeof r.max_width ? r.max_width : 0,
				t = [],
				o = !1;
			for (var i in gr) t.push("[" + i + ' "' + gr[i] + '"]' + e), o = !0;
			o && vr.length && t.push(e);
			for (var f = []; vr.length > 0;) f.push(m());
			for (var a = [], u = "", l = 1; f.length > 0;) {
				var s = f.pop();
				1 === l && "b" === s.color ? (u = "1. ...", l++) : "w" === s.color && (u.length && a.push(u), u = l + ".", l++), u = u + " " + v(s), y(s)
			}
			if (u.length && a.push(u), "undefined" != typeof gr.Result && a.push(gr.Result), 0 === n) return t.join("") + a.join(" ");
			for (var p = 0, i = 0; i < a.length; i++) p + a[i].length > n && 0 !== i ? (" " === t[t.length - 1] && t.pop(), t.push(e), p = 0) : 0 !== i && (t.push(" "), p++), t.push(a[i]), p += a[i].length;
			return t.join("")
		},
		load_pgn: function(r, e) {
			function o(r) {
				return r.replace(/\\/g, "\\")
			}

			function i(r) {
				for (var e = r.replace(/=/, "")
						.replace(/[+#]?[?!]*$/, ""), n = c(), t = 0, o = n.length; o > t; t++)
					if (e === v(n[t])
						.replace(/=/, "")
						.replace(/[+#]?[?!]*$/, "")) return n[t];
				return null
			}

			function a(r) {
				return i(k(r))
			}

			function u(r) {
				var e = !1;
				for (var n in r) e = !0;
				return e
			}

			function l(r, e) {
				for (var n = "object" == typeof e && "string" == typeof e.newline_char ? e.newline_char : "\r?\n", t = {}, i = r.split(new RegExp(o(n))), f = "", a = "", u = 0; u < i.length; u++) f = i[u].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, "$1"), a = i[u].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, "$1"), k(f)
					.length > 0 && (t[f] = a);
				return t
			}
			var s = "object" == typeof e && "string" == typeof e.newline_char ? e.newline_char : "\r?\n",
				p = new RegExp("^(\\[(.|" + o(s) + ")*\\])(" + o(s) + ")*1.(" + o(s) + "|.)*$", "g"),
				g = r.replace(p, "$1");
			"[" !== g[0] && (g = ""), n();
			var h = l(g, e);
			for (var E in h) f([E, h[E]]);
			if ("1" === h.SetUp && !("FEN" in h && t(h.FEN))) return !1;
			var d = r.replace(g, "")
				.replace(new RegExp(o(s), "g"), " ");
			d = d.replace(/(\{[^}]+\})+?/g, "");
			for (var b = /(\([^\(\)]+\))+?/g; b.test(d);) d = d.replace(b, "");
			d = d.replace(/\d+\./g, ""), d = d.replace(/\.\.\./g, "");
			var _ = k(d)
				.split(new RegExp(/\s+/));
			_ = _.join(",")
				.replace(/,,+/g, ",")
				.split(",");
			for (var A = "", S = 0; S < _.length - 1; S++) {
				if (A = a(_[S]), null == A) return !1;
				y(A)
			}
			if (A = _[_.length - 1], W.indexOf(A) > -1) u(gr) && "undefined" == typeof gr.Result && f(["Result", A]);
			else {
				if (A = a(A), null == A) return !1;
				y(A)
			}
			return !0
		},
		header: function() {
			return f(arguments)
		},
		ascii: function() {
			return T()
		},
		turn: function() {
			return ur
		},
		move: function(r) {
			var e = null,
				n = c();
			if ("string" == typeof r) {
				for (var t = r.replace(/=/, "")
						.replace(/[+#]?[?!]*$/, ""), o = 0, i = n.length; i > o; o++)
					if (t === v(n[o])
						.replace(/=/, "")
						.replace(/[+#]?[?!]*$/, "")) {
						e = n[o];
						break
					}
			} else if ("object" == typeof r)
				for (var o = 0, i = n.length; i > o; o++)
					if (!(r.from !== w(n[o].from) || r.to !== w(n[o].to) || "promotion" in n[o] && r.promotion !== n[o].promotion)) {
						e = n[o];
						break
					}
			if (!e) return null;
			var f = O(e);
			return y(e), f
		},
		undo: function() {
			var r = m();
			return r ? O(r) : null
		},
		clear: function() {
			return e()
		},
		put: function(r, e) {
			return l(r, e)
		},
		get: function(r) {
			return u(r)
		},
		remove: function(r) {
			return s(r)
		},
		perft: function(r) {
			return D(r)
		},
		square_color: function(r) {
			if (r in or) {
				var e = or[r];
				return (I(e) + P(e)) % 2 === 0 ? "light" : "dark"
			}
			return null
		},
		history: function(r) {
			for (var e = [], n = [], t = ("undefined" != typeof r && "verbose" in r && r.verbose); vr.length > 0;) e.push(m());
			for (; e.length > 0;) {
				var o = e.pop();
				n.push(t ? O(o) : v(o)), y(o)
			}
			return n
		}
	}
};
"undefined" != typeof exports && (exports.Chess = Chess), "undefined" != typeof define && define(function() {
	return Chess
});
