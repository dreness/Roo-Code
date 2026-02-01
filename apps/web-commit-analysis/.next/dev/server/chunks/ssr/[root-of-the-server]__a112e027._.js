module.exports = [
	"[project]/Roo-Code/node_modules/.pnpm/next@16.1.6_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
			value: true,
		})
		Object.defineProperty(exports, "registerServerReference", {
			enumerable: true,
			get: function () {
				return _server.registerServerReference
			},
		})
		const _server = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/next@16.1.6_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)",
		) //# sourceMappingURL=server-reference.js.map
	},
	"[project]/Roo-Code/node_modules/.pnpm/next@16.1.6_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		// This function ensures that all the exported values are valid server actions,
		// during the runtime. By definition all actions are required to be async
		// functions, but here we can only check that they are functions.
		Object.defineProperty(exports, "__esModule", {
			value: true,
		})
		Object.defineProperty(exports, "ensureServerEntryExports", {
			enumerable: true,
			get: function () {
				return ensureServerEntryExports
			},
		})
		function ensureServerEntryExports(actions) {
			for (let i = 0; i < actions.length; i++) {
				const action = actions[i]
				if (typeof action !== "function") {
					throw Object.defineProperty(
						new Error(
							`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`,
						),
						"__NEXT_ERROR_CODE",
						{
							value: "E352",
							enumerable: false,
							configurable: true,
						},
					)
				}
			}
		} //# sourceMappingURL=action-validate.js.map
	},
	"[externals]/better-sqlite3 [external] (better-sqlite3, cjs, [project]/Roo-Code/node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3)",
	(__turbopack_context__, module, exports) => {
		const mod = __turbopack_context__.x("better-sqlite3-edc3fc950c046175", () =>
			require("better-sqlite3-edc3fc950c046175"),
		)

		module.exports = mod
	},
	"[project]/Roo-Code/node_modules/.pnpm/is-plain-obj@4.1.0/node_modules/is-plain-obj/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => isPlainObject])
		function isPlainObject(value) {
			if (typeof value !== "object" || value === null) {
				return false
			}
			const prototype = Object.getPrototypeOf(value)
			return (
				(prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) &&
				!(Symbol.toStringTag in value) &&
				!(Symbol.iterator in value)
			)
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/is-unicode-supported@2.1.0/node_modules/is-unicode-supported/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => isUnicodeSupported])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:process [external] (node:process, cjs)")
		function isUnicodeSupported() {
			const { env } =
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__[
					"default"
				]
			const { TERM, TERM_PROGRAM } = env
			if (
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__[
					"default"
				].platform !== "win32"
			) {
				return TERM !== "linux" // Linux console (kernel)
			}
			return (
				Boolean(env.WT_SESSION) || // Windows Terminal
				Boolean(env.TERMINUS_SUBLIME) || // Terminus (<0.2.27)
				env.ConEmuTask === "{cmd::Cmder}" || // ConEmu and cmder
				TERM_PROGRAM === "Terminus-Sublime" ||
				TERM_PROGRAM === "vscode" ||
				TERM === "xterm-256color" ||
				TERM === "alacritty" ||
				TERM === "rxvt-unicode" ||
				TERM === "rxvt-unicode-256color" ||
				env.TERMINAL_EMULATOR === "JetBrains-JediTerm"
			)
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/figures@6.1.0/node_modules/figures/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([
			"default",
			() => __TURBOPACK__default__export__,
			"fallbackSymbols",
			() => fallbackSymbols,
			"mainSymbols",
			() => mainSymbols,
			"replaceSymbols",
			() => replaceSymbols,
		])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$is$2d$unicode$2d$supported$40$2$2e$1$2e$0$2f$node_modules$2f$is$2d$unicode$2d$supported$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/is-unicode-supported@2.1.0/node_modules/is-unicode-supported/index.js [app-rsc] (ecmascript)",
			)
		const common = {
			circleQuestionMark: "(?)",
			questionMarkPrefix: "(?)",
			square: "█",
			squareDarkShade: "▓",
			squareMediumShade: "▒",
			squareLightShade: "░",
			squareTop: "▀",
			squareBottom: "▄",
			squareLeft: "▌",
			squareRight: "▐",
			squareCenter: "■",
			bullet: "●",
			dot: "․",
			ellipsis: "…",
			pointerSmall: "›",
			triangleUp: "▲",
			triangleUpSmall: "▴",
			triangleDown: "▼",
			triangleDownSmall: "▾",
			triangleLeftSmall: "◂",
			triangleRightSmall: "▸",
			home: "⌂",
			heart: "♥",
			musicNote: "♪",
			musicNoteBeamed: "♫",
			arrowUp: "↑",
			arrowDown: "↓",
			arrowLeft: "←",
			arrowRight: "→",
			arrowLeftRight: "↔",
			arrowUpDown: "↕",
			almostEqual: "≈",
			notEqual: "≠",
			lessOrEqual: "≤",
			greaterOrEqual: "≥",
			identical: "≡",
			infinity: "∞",
			subscriptZero: "₀",
			subscriptOne: "₁",
			subscriptTwo: "₂",
			subscriptThree: "₃",
			subscriptFour: "₄",
			subscriptFive: "₅",
			subscriptSix: "₆",
			subscriptSeven: "₇",
			subscriptEight: "₈",
			subscriptNine: "₉",
			oneHalf: "½",
			oneThird: "⅓",
			oneQuarter: "¼",
			oneFifth: "⅕",
			oneSixth: "⅙",
			oneEighth: "⅛",
			twoThirds: "⅔",
			twoFifths: "⅖",
			threeQuarters: "¾",
			threeFifths: "⅗",
			threeEighths: "⅜",
			fourFifths: "⅘",
			fiveSixths: "⅚",
			fiveEighths: "⅝",
			sevenEighths: "⅞",
			line: "─",
			lineBold: "━",
			lineDouble: "═",
			lineDashed0: "┄",
			lineDashed1: "┅",
			lineDashed2: "┈",
			lineDashed3: "┉",
			lineDashed4: "╌",
			lineDashed5: "╍",
			lineDashed6: "╴",
			lineDashed7: "╶",
			lineDashed8: "╸",
			lineDashed9: "╺",
			lineDashed10: "╼",
			lineDashed11: "╾",
			lineDashed12: "−",
			lineDashed13: "–",
			lineDashed14: "‐",
			lineDashed15: "⁃",
			lineVertical: "│",
			lineVerticalBold: "┃",
			lineVerticalDouble: "║",
			lineVerticalDashed0: "┆",
			lineVerticalDashed1: "┇",
			lineVerticalDashed2: "┊",
			lineVerticalDashed3: "┋",
			lineVerticalDashed4: "╎",
			lineVerticalDashed5: "╏",
			lineVerticalDashed6: "╵",
			lineVerticalDashed7: "╷",
			lineVerticalDashed8: "╹",
			lineVerticalDashed9: "╻",
			lineVerticalDashed10: "╽",
			lineVerticalDashed11: "╿",
			lineDownLeft: "┐",
			lineDownLeftArc: "╮",
			lineDownBoldLeftBold: "┓",
			lineDownBoldLeft: "┒",
			lineDownLeftBold: "┑",
			lineDownDoubleLeftDouble: "╗",
			lineDownDoubleLeft: "╖",
			lineDownLeftDouble: "╕",
			lineDownRight: "┌",
			lineDownRightArc: "╭",
			lineDownBoldRightBold: "┏",
			lineDownBoldRight: "┎",
			lineDownRightBold: "┍",
			lineDownDoubleRightDouble: "╔",
			lineDownDoubleRight: "╓",
			lineDownRightDouble: "╒",
			lineUpLeft: "┘",
			lineUpLeftArc: "╯",
			lineUpBoldLeftBold: "┛",
			lineUpBoldLeft: "┚",
			lineUpLeftBold: "┙",
			lineUpDoubleLeftDouble: "╝",
			lineUpDoubleLeft: "╜",
			lineUpLeftDouble: "╛",
			lineUpRight: "└",
			lineUpRightArc: "╰",
			lineUpBoldRightBold: "┗",
			lineUpBoldRight: "┖",
			lineUpRightBold: "┕",
			lineUpDoubleRightDouble: "╚",
			lineUpDoubleRight: "╙",
			lineUpRightDouble: "╘",
			lineUpDownLeft: "┤",
			lineUpBoldDownBoldLeftBold: "┫",
			lineUpBoldDownBoldLeft: "┨",
			lineUpDownLeftBold: "┥",
			lineUpBoldDownLeftBold: "┩",
			lineUpDownBoldLeftBold: "┪",
			lineUpDownBoldLeft: "┧",
			lineUpBoldDownLeft: "┦",
			lineUpDoubleDownDoubleLeftDouble: "╣",
			lineUpDoubleDownDoubleLeft: "╢",
			lineUpDownLeftDouble: "╡",
			lineUpDownRight: "├",
			lineUpBoldDownBoldRightBold: "┣",
			lineUpBoldDownBoldRight: "┠",
			lineUpDownRightBold: "┝",
			lineUpBoldDownRightBold: "┡",
			lineUpDownBoldRightBold: "┢",
			lineUpDownBoldRight: "┟",
			lineUpBoldDownRight: "┞",
			lineUpDoubleDownDoubleRightDouble: "╠",
			lineUpDoubleDownDoubleRight: "╟",
			lineUpDownRightDouble: "╞",
			lineDownLeftRight: "┬",
			lineDownBoldLeftBoldRightBold: "┳",
			lineDownLeftBoldRightBold: "┯",
			lineDownBoldLeftRight: "┰",
			lineDownBoldLeftBoldRight: "┱",
			lineDownBoldLeftRightBold: "┲",
			lineDownLeftRightBold: "┮",
			lineDownLeftBoldRight: "┭",
			lineDownDoubleLeftDoubleRightDouble: "╦",
			lineDownDoubleLeftRight: "╥",
			lineDownLeftDoubleRightDouble: "╤",
			lineUpLeftRight: "┴",
			lineUpBoldLeftBoldRightBold: "┻",
			lineUpLeftBoldRightBold: "┷",
			lineUpBoldLeftRight: "┸",
			lineUpBoldLeftBoldRight: "┹",
			lineUpBoldLeftRightBold: "┺",
			lineUpLeftRightBold: "┶",
			lineUpLeftBoldRight: "┵",
			lineUpDoubleLeftDoubleRightDouble: "╩",
			lineUpDoubleLeftRight: "╨",
			lineUpLeftDoubleRightDouble: "╧",
			lineUpDownLeftRight: "┼",
			lineUpBoldDownBoldLeftBoldRightBold: "╋",
			lineUpDownBoldLeftBoldRightBold: "╈",
			lineUpBoldDownLeftBoldRightBold: "╇",
			lineUpBoldDownBoldLeftRightBold: "╊",
			lineUpBoldDownBoldLeftBoldRight: "╉",
			lineUpBoldDownLeftRight: "╀",
			lineUpDownBoldLeftRight: "╁",
			lineUpDownLeftBoldRight: "┽",
			lineUpDownLeftRightBold: "┾",
			lineUpBoldDownBoldLeftRight: "╂",
			lineUpDownLeftBoldRightBold: "┿",
			lineUpBoldDownLeftBoldRight: "╃",
			lineUpBoldDownLeftRightBold: "╄",
			lineUpDownBoldLeftBoldRight: "╅",
			lineUpDownBoldLeftRightBold: "╆",
			lineUpDoubleDownDoubleLeftDoubleRightDouble: "╬",
			lineUpDoubleDownDoubleLeftRight: "╫",
			lineUpDownLeftDoubleRightDouble: "╪",
			lineCross: "╳",
			lineBackslash: "╲",
			lineSlash: "╱",
		}
		const specialMainSymbols = {
			tick: "✔",
			info: "ℹ",
			warning: "⚠",
			cross: "✘",
			squareSmall: "◻",
			squareSmallFilled: "◼",
			circle: "◯",
			circleFilled: "◉",
			circleDotted: "◌",
			circleDouble: "◎",
			circleCircle: "ⓞ",
			circleCross: "ⓧ",
			circlePipe: "Ⓘ",
			radioOn: "◉",
			radioOff: "◯",
			checkboxOn: "☒",
			checkboxOff: "☐",
			checkboxCircleOn: "ⓧ",
			checkboxCircleOff: "Ⓘ",
			pointer: "❯",
			triangleUpOutline: "△",
			triangleLeft: "◀",
			triangleRight: "▶",
			lozenge: "◆",
			lozengeOutline: "◇",
			hamburger: "☰",
			smiley: "㋡",
			mustache: "෴",
			star: "★",
			play: "▶",
			nodejs: "⬢",
			oneSeventh: "⅐",
			oneNinth: "⅑",
			oneTenth: "⅒",
		}
		const specialFallbackSymbols = {
			tick: "√",
			info: "i",
			warning: "‼",
			cross: "×",
			squareSmall: "□",
			squareSmallFilled: "■",
			circle: "( )",
			circleFilled: "(*)",
			circleDotted: "( )",
			circleDouble: "( )",
			circleCircle: "(○)",
			circleCross: "(×)",
			circlePipe: "(│)",
			radioOn: "(*)",
			radioOff: "( )",
			checkboxOn: "[×]",
			checkboxOff: "[ ]",
			checkboxCircleOn: "(×)",
			checkboxCircleOff: "( )",
			pointer: ">",
			triangleUpOutline: "∆",
			triangleLeft: "◄",
			triangleRight: "►",
			lozenge: "♦",
			lozengeOutline: "◊",
			hamburger: "≡",
			smiley: "☺",
			mustache: "┌─┐",
			star: "✶",
			play: "►",
			nodejs: "♦",
			oneSeventh: "1/7",
			oneNinth: "1/9",
			oneTenth: "1/10",
		}
		const mainSymbols = {
			...common,
			...specialMainSymbols,
		}
		const fallbackSymbols = {
			...common,
			...specialFallbackSymbols,
		}
		const shouldUseMain = (0,
		__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$is$2d$unicode$2d$supported$40$2$2e$1$2e$0$2f$node_modules$2f$is$2d$unicode$2d$supported$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
			"default"
		])()
		const figures = shouldUseMain ? mainSymbols : fallbackSymbols
		const __TURBOPACK__default__export__ = figures
		const replacements = Object.entries(specialMainSymbols)
		const replaceSymbols = (string, { useFallback = !shouldUseMain } = {}) => {
			if (useFallback) {
				for (const [key, mainSymbol] of replacements) {
					string = string.replaceAll(mainSymbol, fallbackSymbols[key])
				}
			}
			return string
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/yoctocolors@2.1.1/node_modules/yoctocolors/base.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([
			"bgBlack",
			() => bgBlack,
			"bgBlue",
			() => bgBlue,
			"bgBlueBright",
			() => bgBlueBright,
			"bgCyan",
			() => bgCyan,
			"bgCyanBright",
			() => bgCyanBright,
			"bgGray",
			() => bgGray,
			"bgGreen",
			() => bgGreen,
			"bgGreenBright",
			() => bgGreenBright,
			"bgMagenta",
			() => bgMagenta,
			"bgMagentaBright",
			() => bgMagentaBright,
			"bgRed",
			() => bgRed,
			"bgRedBright",
			() => bgRedBright,
			"bgWhite",
			() => bgWhite,
			"bgWhiteBright",
			() => bgWhiteBright,
			"bgYellow",
			() => bgYellow,
			"bgYellowBright",
			() => bgYellowBright,
			"black",
			() => black,
			"blue",
			() => blue,
			"blueBright",
			() => blueBright,
			"bold",
			() => bold,
			"cyan",
			() => cyan,
			"cyanBright",
			() => cyanBright,
			"dim",
			() => dim,
			"gray",
			() => gray,
			"green",
			() => green,
			"greenBright",
			() => greenBright,
			"hidden",
			() => hidden,
			"inverse",
			() => inverse,
			"italic",
			() => italic,
			"magenta",
			() => magenta,
			"magentaBright",
			() => magentaBright,
			"overline",
			() => overline,
			"red",
			() => red,
			"redBright",
			() => redBright,
			"reset",
			() => reset,
			"strikethrough",
			() => strikethrough,
			"underline",
			() => underline,
			"white",
			() => white,
			"whiteBright",
			() => whiteBright,
			"yellow",
			() => yellow,
			"yellowBright",
			() => yellowBright,
		])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$tty__$5b$external$5d$__$28$node$3a$tty$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:tty [external] (node:tty, cjs)")
		// eslint-disable-next-line no-warning-comments
		// TODO: Use a better method when it's added to Node.js (https://github.com/nodejs/node/pull/40240)
		// Lots of optionals here to support Deno.
		const hasColors =
			__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$tty__$5b$external$5d$__$28$node$3a$tty$2c$__cjs$29$__[
				"default"
			]?.WriteStream?.prototype?.hasColors?.() ?? false
		const format = (open, close) => {
			if (!hasColors) {
				return (input) => input
			}
			const openCode = `\u001B[${open}m`
			const closeCode = `\u001B[${close}m`
			return (input) => {
				const string = input + "" // eslint-disable-line no-implicit-coercion -- This is faster.
				let index = string.indexOf(closeCode)
				if (index === -1) {
					// Note: Intentionally not using string interpolation for performance reasons.
					return openCode + string + closeCode
				}
				// Handle nested colors.
				// We could have done this, but it's too slow (as of Node.js 22).
				// return openCode + string.replaceAll(closeCode, openCode) + closeCode;
				let result = openCode
				let lastIndex = 0
				while (index !== -1) {
					result += string.slice(lastIndex, index) + openCode
					lastIndex = index + closeCode.length
					index = string.indexOf(closeCode, lastIndex)
				}
				result += string.slice(lastIndex) + closeCode
				return result
			}
		}
		const reset = format(0, 0)
		const bold = format(1, 22)
		const dim = format(2, 22)
		const italic = format(3, 23)
		const underline = format(4, 24)
		const overline = format(53, 55)
		const inverse = format(7, 27)
		const hidden = format(8, 28)
		const strikethrough = format(9, 29)
		const black = format(30, 39)
		const red = format(31, 39)
		const green = format(32, 39)
		const yellow = format(33, 39)
		const blue = format(34, 39)
		const magenta = format(35, 39)
		const cyan = format(36, 39)
		const white = format(37, 39)
		const gray = format(90, 39)
		const bgBlack = format(40, 49)
		const bgRed = format(41, 49)
		const bgGreen = format(42, 49)
		const bgYellow = format(43, 49)
		const bgBlue = format(44, 49)
		const bgMagenta = format(45, 49)
		const bgCyan = format(46, 49)
		const bgWhite = format(47, 49)
		const bgGray = format(100, 49)
		const redBright = format(91, 39)
		const greenBright = format(92, 39)
		const yellowBright = format(93, 39)
		const blueBright = format(94, 39)
		const magentaBright = format(95, 39)
		const cyanBright = format(96, 39)
		const whiteBright = format(97, 39)
		const bgRedBright = format(101, 49)
		const bgGreenBright = format(102, 49)
		const bgYellowBright = format(103, 49)
		const bgBlueBright = format(104, 49)
		const bgMagentaBright = format(105, 49)
		const bgCyanBright = format(106, 49)
		const bgWhiteBright = format(107, 49)
	},
	"[project]/Roo-Code/node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		module.exports = isexe
		isexe.sync = sync
		var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)")
		function isexe(path, options, cb) {
			fs.stat(path, function (er, stat) {
				cb(er, er ? false : checkStat(stat, options))
			})
		}
		function sync(path, options) {
			return checkStat(fs.statSync(path), options)
		}
		function checkStat(stat, options) {
			return stat.isFile() && checkMode(stat, options)
		}
		function checkMode(stat, options) {
			var mod = stat.mode
			var uid = stat.uid
			var gid = stat.gid
			var myUid = options.uid !== undefined ? options.uid : process.getuid && process.getuid()
			var myGid = options.gid !== undefined ? options.gid : process.getgid && process.getgid()
			var u = parseInt("100", 8)
			var g = parseInt("010", 8)
			var o = parseInt("001", 8)
			var ug = u | g
			var ret = mod & o || (mod & g && gid === myGid) || (mod & u && uid === myUid) || (mod & ug && myUid === 0)
			return ret
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		module.exports = isexe
		isexe.sync = sync
		var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)")
		function checkPathExt(path, options) {
			var pathext = options.pathExt !== undefined ? options.pathExt : process.env.PATHEXT
			if (!pathext) {
				return true
			}
			pathext = pathext.split(";")
			if (pathext.indexOf("") !== -1) {
				return true
			}
			for (var i = 0; i < pathext.length; i++) {
				var p = pathext[i].toLowerCase()
				if (p && path.substr(-p.length).toLowerCase() === p) {
					return true
				}
			}
			return false
		}
		function checkStat(stat, path, options) {
			if (!stat.isSymbolicLink() && !stat.isFile()) {
				return false
			}
			return checkPathExt(path, options)
		}
		function isexe(path, options, cb) {
			fs.stat(path, function (er, stat) {
				cb(er, er ? false : checkStat(stat, path, options))
			})
		}
		function sync(path, options) {
			return checkStat(fs.statSync(path), path, options)
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		var fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)")
		var core
		if (process.platform === "win32" || /*TURBOPACK member replacement*/ __turbopack_context__.g.TESTING_WINDOWS) {
			core = __turbopack_context__.r(
				"[project]/Roo-Code/node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/windows.js [app-rsc] (ecmascript)",
			)
		} else {
			core = __turbopack_context__.r(
				"[project]/Roo-Code/node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/mode.js [app-rsc] (ecmascript)",
			)
		}
		module.exports = isexe
		isexe.sync = sync
		function isexe(path, options, cb) {
			if (typeof options === "function") {
				cb = options
				options = {}
			}
			if (!cb) {
				if (typeof Promise !== "function") {
					throw new TypeError("callback not provided")
				}
				return new Promise(function (resolve, reject) {
					isexe(path, options || {}, function (er, is) {
						if (er) {
							reject(er)
						} else {
							resolve(is)
						}
					})
				})
			}
			core(path, options || {}, function (er, is) {
				// ignore EACCES because that just means we aren't allowed to run it
				if (er) {
					if (er.code === "EACCES" || (options && options.ignoreErrors)) {
						er = null
						is = false
					}
				}
				cb(er, is)
			})
		}
		function sync(path, options) {
			// my kingdom for a filtered catch
			try {
				return core.sync(path, options || {})
			} catch (er) {
				if ((options && options.ignoreErrors) || er.code === "EACCES") {
					return false
				} else {
					throw er
				}
			}
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/which@2.0.2/node_modules/which/which.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		const isWindows =
			process.platform === "win32" || process.env.OSTYPE === "cygwin" || process.env.OSTYPE === "msys"
		const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)")
		const COLON = isWindows ? ";" : ":"
		const isexe = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/isexe@2.0.0/node_modules/isexe/index.js [app-rsc] (ecmascript)",
		)
		const getNotFoundError = (cmd) =>
			Object.assign(new Error(`not found: ${cmd}`), {
				code: "ENOENT",
			})
		const getPathInfo = (cmd, opt) => {
			const colon = opt.colon || COLON
			// If it has a slash, then we don't bother searching the pathenv.
			// just check the file itself, and that's it.
			const pathEnv =
				cmd.match(/\//) || (isWindows && cmd.match(/\\/))
					? [""]
					: [
							// windows always checks the cwd first
							...(isWindows ? [process.cwd()] : []),
							...(opt.path || process.env.PATH || /* istanbul ignore next: very unusual */ "").split(
								colon,
							),
						]
			const pathExtExe = isWindows ? opt.pathExt || process.env.PATHEXT || ".EXE;.CMD;.BAT;.COM" : ""
			const pathExt = isWindows ? pathExtExe.split(colon) : [""]
			if (isWindows) {
				if (cmd.indexOf(".") !== -1 && pathExt[0] !== "") pathExt.unshift("")
			}
			return {
				pathEnv,
				pathExt,
				pathExtExe,
			}
		}
		const which = (cmd, opt, cb) => {
			if (typeof opt === "function") {
				cb = opt
				opt = {}
			}
			if (!opt) opt = {}
			const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt)
			const found = []
			const step = (i) =>
				new Promise((resolve, reject) => {
					if (i === pathEnv.length)
						return opt.all && found.length ? resolve(found) : reject(getNotFoundError(cmd))
					const ppRaw = pathEnv[i]
					const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw
					const pCmd = path.join(pathPart, cmd)
					const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd
					resolve(subStep(p, i, 0))
				})
			const subStep = (p, i, ii) =>
				new Promise((resolve, reject) => {
					if (ii === pathExt.length) return resolve(step(i + 1))
					const ext = pathExt[ii]
					isexe(
						p + ext,
						{
							pathExt: pathExtExe,
						},
						(er, is) => {
							if (!er && is) {
								if (opt.all) found.push(p + ext)
								else return resolve(p + ext)
							}
							return resolve(subStep(p, i, ii + 1))
						},
					)
				})
			return cb ? step(0).then((res) => cb(null, res), cb) : step(0)
		}
		const whichSync = (cmd, opt) => {
			opt = opt || {}
			const { pathEnv, pathExt, pathExtExe } = getPathInfo(cmd, opt)
			const found = []
			for (let i = 0; i < pathEnv.length; i++) {
				const ppRaw = pathEnv[i]
				const pathPart = /^".*"$/.test(ppRaw) ? ppRaw.slice(1, -1) : ppRaw
				const pCmd = path.join(pathPart, cmd)
				const p = !pathPart && /^\.[\\\/]/.test(cmd) ? cmd.slice(0, 2) + pCmd : pCmd
				for (let j = 0; j < pathExt.length; j++) {
					const cur = p + pathExt[j]
					try {
						const is = isexe.sync(cur, {
							pathExt: pathExtExe,
						})
						if (is) {
							if (opt.all) found.push(cur)
							else return cur
						}
					} catch (ex) {}
				}
			}
			if (opt.all && found.length) return found
			if (opt.nothrow) return null
			throw getNotFoundError(cmd)
		}
		module.exports = which
		which.sync = whichSync
	},
	"[project]/Roo-Code/node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const pathKey = (options = {}) => {
			const environment = options.env || process.env
			const platform = options.platform || process.platform
			if (platform !== "win32") {
				return "PATH"
			}
			return (
				Object.keys(environment)
					.reverse()
					.find((key) => key.toUpperCase() === "PATH") || "Path"
			)
		}
		module.exports = pathKey
		// TODO: Remove this for the next major release
		module.exports.default = pathKey
	},
	"[project]/Roo-Code/node_modules/.pnpm/path-key@4.0.0/node_modules/path-key/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => pathKey])
		function pathKey(options = {}) {
			const { env = process.env, platform = process.platform } = options
			if (platform !== "win32") {
				return "PATH"
			}
			return (
				Object.keys(env)
					.reverse()
					.find((key) => key.toUpperCase() === "PATH") || "Path"
			)
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/resolveCommand.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)")
		const which = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/which@2.0.2/node_modules/which/which.js [app-rsc] (ecmascript)",
		)
		const getPathKey = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/path-key@3.1.1/node_modules/path-key/index.js [app-rsc] (ecmascript)",
		)
		function resolveCommandAttempt(parsed, withoutPathExt) {
			const env = parsed.options.env || process.env
			const cwd = process.cwd()
			const hasCustomCwd = parsed.options.cwd != null
			// Worker threads do not have process.chdir()
			const shouldSwitchCwd = hasCustomCwd && process.chdir !== undefined && !process.chdir.disabled
			// If a custom `cwd` was specified, we need to change the process cwd
			// because `which` will do stat calls but does not support a custom cwd
			if (shouldSwitchCwd) {
				try {
					process.chdir(parsed.options.cwd)
				} catch (err) {
					/* Empty */
				}
			}
			let resolved
			try {
				resolved = which.sync(parsed.command, {
					path: env[
						getPathKey({
							env,
						})
					],
					pathExt: withoutPathExt ? path.delimiter : undefined,
				})
			} catch (e) {
				/* Empty */
			} finally {
				if (shouldSwitchCwd) {
					process.chdir(cwd)
				}
			}
			// If we successfully resolved, ensure that an absolute path is returned
			// Note that when a custom `cwd` was used, we need to resolve to an absolute path based on it
			if (resolved) {
				resolved = path.resolve(hasCustomCwd ? parsed.options.cwd : "", resolved)
			}
			return resolved
		}
		function resolveCommand(parsed) {
			return resolveCommandAttempt(parsed) || resolveCommandAttempt(parsed, true)
		}
		module.exports = resolveCommand
	},
	"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/escape.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		// See http://www.robvanderwoude.com/escapechars.php
		const metaCharsRegExp = /([()\][%!^"`<>&|;, *?])/g
		function escapeCommand(arg) {
			// Escape meta chars
			arg = arg.replace(metaCharsRegExp, "^$1")
			return arg
		}
		function escapeArgument(arg, doubleEscapeMetaChars) {
			// Convert to string
			arg = `${arg}`
			// Algorithm below is based on https://qntm.org/cmd
			// It's slightly altered to disable JS backtracking to avoid hanging on specially crafted input
			// Please see https://github.com/moxystudio/node-cross-spawn/pull/160 for more information
			// Sequence of backslashes followed by a double quote:
			// double up all the backslashes and escape the double quote
			arg = arg.replace(/(?=(\\+?)?)\1"/g, '$1$1\\"')
			// Sequence of backslashes followed by the end of the string
			// (which will become a double quote later):
			// double up all the backslashes
			arg = arg.replace(/(?=(\\+?)?)\1$/, "$1$1")
			// All other backslashes occur literally
			// Quote the whole thing:
			arg = `"${arg}"`
			// Escape meta chars
			arg = arg.replace(metaCharsRegExp, "^$1")
			// Double escape meta chars if necessary
			if (doubleEscapeMetaChars) {
				arg = arg.replace(metaCharsRegExp, "^$1")
			}
			return arg
		}
		module.exports.command = escapeCommand
		module.exports.argument = escapeArgument
	},
	"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/readShebang.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const fs = __turbopack_context__.r("[externals]/fs [external] (fs, cjs)")
		const shebangCommand = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js [app-rsc] (ecmascript)",
		)
		function readShebang(command) {
			// Read the first 150 bytes from the file
			const size = 150
			const buffer = Buffer.alloc(size)
			let fd
			try {
				fd = fs.openSync(command, "r")
				fs.readSync(fd, buffer, 0, size, 0)
				fs.closeSync(fd)
			} catch (e) {}
			// Attempt to extract shebang (null is returned if not a shebang)
			return shebangCommand(buffer.toString())
		}
		module.exports = readShebang
	},
	"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/parse.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const path = __turbopack_context__.r("[externals]/path [external] (path, cjs)")
		const resolveCommand = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/resolveCommand.js [app-rsc] (ecmascript)",
		)
		const escape = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/escape.js [app-rsc] (ecmascript)",
		)
		const readShebang = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/util/readShebang.js [app-rsc] (ecmascript)",
		)
		const isWin = process.platform === "win32"
		const isExecutableRegExp = /\.(?:com|exe)$/i
		const isCmdShimRegExp = /node_modules[\\/].bin[\\/][^\\/]+\.cmd$/i
		function detectShebang(parsed) {
			parsed.file = resolveCommand(parsed)
			const shebang = parsed.file && readShebang(parsed.file)
			if (shebang) {
				parsed.args.unshift(parsed.file)
				parsed.command = shebang
				return resolveCommand(parsed)
			}
			return parsed.file
		}
		function parseNonShell(parsed) {
			if (("TURBOPACK compile-time truthy", 1)) {
				return parsed
			}
			//TURBOPACK unreachable
			// Detect & add support for shebangs
			const commandFile = undefined
			// We don't need a shell if the command filename is an executable
			const needsShell = undefined
		}
		function parse(command, args, options) {
			// Normalize arguments, similar to nodejs
			if (args && !Array.isArray(args)) {
				options = args
				args = null
			}
			args = args ? args.slice(0) : [] // Clone array to avoid changing the original
			options = Object.assign({}, options) // Clone object to avoid changing the original
			// Build our parsed object
			const parsed = {
				command,
				args,
				options,
				file: undefined,
				original: {
					command,
					args,
				},
			}
			// Delegate further parsing to shell or non-shell
			return options.shell ? parsed : parseNonShell(parsed)
		}
		module.exports = parse
	},
	"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/enoent.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const isWin = process.platform === "win32"
		function notFoundError(original, syscall) {
			return Object.assign(new Error(`${syscall} ${original.command} ENOENT`), {
				code: "ENOENT",
				errno: "ENOENT",
				syscall: `${syscall} ${original.command}`,
				path: original.command,
				spawnargs: original.args,
			})
		}
		function hookChildProcess(cp, parsed) {
			if (("TURBOPACK compile-time truthy", 1)) {
				return
			}
			//TURBOPACK unreachable
			const originalEmit = undefined
		}
		function verifyENOENT(status, parsed) {
			if (
				("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
			);
			return null
		}
		function verifyENOENTSync(status, parsed) {
			if (
				("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
			);
			return null
		}
		module.exports = {
			hookChildProcess,
			verifyENOENT,
			verifyENOENTSync,
			notFoundError,
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const cp = __turbopack_context__.r("[externals]/child_process [external] (child_process, cjs)")
		const parse = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/parse.js [app-rsc] (ecmascript)",
		)
		const enoent = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/cross-spawn@7.0.6/node_modules/cross-spawn/lib/enoent.js [app-rsc] (ecmascript)",
		)
		function spawn(command, args, options) {
			// Parse the arguments
			const parsed = parse(command, args, options)
			// Spawn the child process
			const spawned = cp.spawn(parsed.command, parsed.args, parsed.options)
			// Hook into child process "exit" event to emit an error if the command
			// does not exists, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
			enoent.hookChildProcess(spawned, parsed)
			return spawned
		}
		function spawnSync(command, args, options) {
			// Parse the arguments
			const parsed = parse(command, args, options)
			// Spawn the child process
			const result = cp.spawnSync(parsed.command, parsed.args, parsed.options)
			// Analyze if the command does not exist, see: https://github.com/IndigoUnited/node-cross-spawn/issues/16
			result.error = result.error || enoent.verifyENOENTSync(result.status, parsed)
			return result
		}
		module.exports = spawn
		module.exports.spawn = spawn
		module.exports.sync = spawnSync
		module.exports._parse = parse
		module.exports._enoent = enoent
	},
	"[project]/Roo-Code/node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		module.exports = /^#!(.*)/
	},
	"[project]/Roo-Code/node_modules/.pnpm/shebang-command@2.0.0/node_modules/shebang-command/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__, module, exports) => {
		"use strict"

		const shebangRegex = __turbopack_context__.r(
			"[project]/Roo-Code/node_modules/.pnpm/shebang-regex@3.0.0/node_modules/shebang-regex/index.js [app-rsc] (ecmascript)",
		)
		module.exports = (string = "") => {
			const match = string.match(shebangRegex)
			if (!match) {
				return null
			}
			const [path, argument] = match[0].replace(/#! ?/, "").split(" ")
			const binary = path.split("/").pop()
			if (binary === "env") {
				return argument
			}
			return argument ? `${binary} ${argument}` : binary
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/unicorn-magic@0.3.0/node_modules/unicorn-magic/node.js [app-rsc] (ecmascript) <locals>",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([
			"execFile",
			() => execFile,
			"execFileSync",
			() => execFileSync,
			"rootDirectory",
			() => rootDirectory,
			"toPath",
			() => toPath,
			"traversePathUp",
			() => traversePathUp,
		])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$util__$5b$external$5d$__$28$node$3a$util$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:util [external] (node:util, cjs)")
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:child_process [external] (node:child_process, cjs)")
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)")
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:url [external] (node:url, cjs)")
		const execFileOriginal = (0,
		__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$util__$5b$external$5d$__$28$node$3a$util$2c$__cjs$29$__[
			"promisify"
		])(
			__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__[
				"execFile"
			],
		)
		function toPath(urlOrPath) {
			return urlOrPath instanceof URL
				? (0,
					__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$url__$5b$external$5d$__$28$node$3a$url$2c$__cjs$29$__[
						"fileURLToPath"
					])(urlOrPath)
				: urlOrPath
		}
		function rootDirectory(pathInput) {
			return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
				"default"
			].parse(toPath(pathInput)).root
		}
		function traversePathUp(startPath) {
			return {
				*[Symbol.iterator]() {
					let currentPath =
						__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
							"default"
						].resolve(toPath(startPath))
					let previousPath
					while (previousPath !== currentPath) {
						yield currentPath
						previousPath = currentPath
						currentPath =
							__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
								"default"
							].resolve(currentPath, "..")
					}
				},
			}
		}
		const TEN_MEGABYTES_IN_BYTES = 10 * 1024 * 1024
		async function execFile(file, arguments_, options = {}) {
			return execFileOriginal(file, arguments_, {
				maxBuffer: TEN_MEGABYTES_IN_BYTES,
				...options,
			})
		}
		function execFileSync(file, arguments_ = [], options = {}) {
			return (0,
			__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$child_process__$5b$external$5d$__$28$node$3a$child_process$2c$__cjs$29$__[
				"execFileSync"
			])(file, arguments_, {
				maxBuffer: TEN_MEGABYTES_IN_BYTES,
				encoding: "utf8",
				stdio: "pipe",
				...options,
			})
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/npm-run-path@6.0.0/node_modules/npm-run-path/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["npmRunPath", () => npmRunPath, "npmRunPathEnv", () => npmRunPathEnv])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:process [external] (node:process, cjs)")
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)")
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$path$2d$key$40$4$2e$0$2e$0$2f$node_modules$2f$path$2d$key$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/path-key@4.0.0/node_modules/path-key/index.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$unicorn$2d$magic$40$0$2e$3$2e$0$2f$node_modules$2f$unicorn$2d$magic$2f$node$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/unicorn-magic@0.3.0/node_modules/unicorn-magic/node.js [app-rsc] (ecmascript) <locals>",
			)
		const npmRunPath = ({
			cwd = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__[
				"default"
			].cwd(),
			path: pathOption = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__[
				"default"
			].env[
				(0,
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$path$2d$key$40$4$2e$0$2e$0$2f$node_modules$2f$path$2d$key$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"default"
				])()
			],
			preferLocal = true,
			execPath = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__[
				"default"
			].execPath,
			addExecPath = true,
		} = {}) => {
			const cwdPath =
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
					"default"
				].resolve(
					(0,
					__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$unicorn$2d$magic$40$0$2e$3$2e$0$2f$node_modules$2f$unicorn$2d$magic$2f$node$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__[
						"toPath"
					])(cwd),
				)
			const result = []
			const pathParts = pathOption.split(
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
					"default"
				].delimiter,
			)
			if (preferLocal) {
				applyPreferLocal(result, pathParts, cwdPath)
			}
			if (addExecPath) {
				applyExecPath(result, pathParts, execPath, cwdPath)
			}
			return pathOption === "" ||
				pathOption ===
					__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
						"default"
					].delimiter
				? `${result.join(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].delimiter)}${pathOption}`
				: [...result, pathOption].join(
						__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
							"default"
						].delimiter,
					)
		}
		const applyPreferLocal = (result, pathParts, cwdPath) => {
			for (const directory of (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$unicorn$2d$magic$40$0$2e$3$2e$0$2f$node_modules$2f$unicorn$2d$magic$2f$node$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__[
				"traversePathUp"
			])(cwdPath)) {
				const pathPart =
					__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
						"default"
					].join(directory, "node_modules/.bin")
				if (!pathParts.includes(pathPart)) {
					result.push(pathPart)
				}
			}
		}
		// Ensure the running `node` binary is used
		const applyExecPath = (result, pathParts, execPath, cwdPath) => {
			const pathPart =
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__[
					"default"
				].resolve(
					cwdPath,
					(0,
					__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$unicorn$2d$magic$40$0$2e$3$2e$0$2f$node_modules$2f$unicorn$2d$magic$2f$node$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__[
						"toPath"
					])(execPath),
					"..",
				)
			if (!pathParts.includes(pathPart)) {
				result.push(pathPart)
			}
		}
		const npmRunPathEnv = ({
			env = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$process__$5b$external$5d$__$28$node$3a$process$2c$__cjs$29$__[
				"default"
			].env,
			...options
		} = {}) => {
			env = {
				...env,
			}
			const pathName = (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$path$2d$key$40$4$2e$0$2e$0$2f$node_modules$2f$path$2d$key$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"default"
			])({
				env,
			})
			options.path = env[pathName]
			env[pathName] = npmRunPath(options)
			return env
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/realtime.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["SIGRTMAX", () => SIGRTMAX, "getRealtimeSignals", () => getRealtimeSignals])
		const getRealtimeSignals = () => {
			const length = SIGRTMAX - SIGRTMIN + 1
			return Array.from(
				{
					length,
				},
				getRealtimeSignal,
			)
		}
		const getRealtimeSignal = (value, index) => ({
			name: `SIGRT${index + 1}`,
			number: SIGRTMIN + index,
			action: "terminate",
			description: "Application-specific signal (realtime)",
			standard: "posix",
		})
		const SIGRTMIN = 34
		const SIGRTMAX = 64
	},
	"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/core.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["SIGNALS", () => SIGNALS])
		const SIGNALS = [
			{
				name: "SIGHUP",
				number: 1,
				action: "terminate",
				description: "Terminal closed",
				standard: "posix",
			},
			{
				name: "SIGINT",
				number: 2,
				action: "terminate",
				description: "User interruption with CTRL-C",
				standard: "ansi",
			},
			{
				name: "SIGQUIT",
				number: 3,
				action: "core",
				description: "User interruption with CTRL-\\",
				standard: "posix",
			},
			{
				name: "SIGILL",
				number: 4,
				action: "core",
				description: "Invalid machine instruction",
				standard: "ansi",
			},
			{
				name: "SIGTRAP",
				number: 5,
				action: "core",
				description: "Debugger breakpoint",
				standard: "posix",
			},
			{
				name: "SIGABRT",
				number: 6,
				action: "core",
				description: "Aborted",
				standard: "ansi",
			},
			{
				name: "SIGIOT",
				number: 6,
				action: "core",
				description: "Aborted",
				standard: "bsd",
			},
			{
				name: "SIGBUS",
				number: 7,
				action: "core",
				description: "Bus error due to misaligned, non-existing address or paging error",
				standard: "bsd",
			},
			{
				name: "SIGEMT",
				number: 7,
				action: "terminate",
				description: "Command should be emulated but is not implemented",
				standard: "other",
			},
			{
				name: "SIGFPE",
				number: 8,
				action: "core",
				description: "Floating point arithmetic error",
				standard: "ansi",
			},
			{
				name: "SIGKILL",
				number: 9,
				action: "terminate",
				description: "Forced termination",
				standard: "posix",
				forced: true,
			},
			{
				name: "SIGUSR1",
				number: 10,
				action: "terminate",
				description: "Application-specific signal",
				standard: "posix",
			},
			{
				name: "SIGSEGV",
				number: 11,
				action: "core",
				description: "Segmentation fault",
				standard: "ansi",
			},
			{
				name: "SIGUSR2",
				number: 12,
				action: "terminate",
				description: "Application-specific signal",
				standard: "posix",
			},
			{
				name: "SIGPIPE",
				number: 13,
				action: "terminate",
				description: "Broken pipe or socket",
				standard: "posix",
			},
			{
				name: "SIGALRM",
				number: 14,
				action: "terminate",
				description: "Timeout or timer",
				standard: "posix",
			},
			{
				name: "SIGTERM",
				number: 15,
				action: "terminate",
				description: "Termination",
				standard: "ansi",
			},
			{
				name: "SIGSTKFLT",
				number: 16,
				action: "terminate",
				description: "Stack is empty or overflowed",
				standard: "other",
			},
			{
				name: "SIGCHLD",
				number: 17,
				action: "ignore",
				description: "Child process terminated, paused or unpaused",
				standard: "posix",
			},
			{
				name: "SIGCLD",
				number: 17,
				action: "ignore",
				description: "Child process terminated, paused or unpaused",
				standard: "other",
			},
			{
				name: "SIGCONT",
				number: 18,
				action: "unpause",
				description: "Unpaused",
				standard: "posix",
				forced: true,
			},
			{
				name: "SIGSTOP",
				number: 19,
				action: "pause",
				description: "Paused",
				standard: "posix",
				forced: true,
			},
			{
				name: "SIGTSTP",
				number: 20,
				action: "pause",
				description: 'Paused using CTRL-Z or "suspend"',
				standard: "posix",
			},
			{
				name: "SIGTTIN",
				number: 21,
				action: "pause",
				description: "Background process cannot read terminal input",
				standard: "posix",
			},
			{
				name: "SIGBREAK",
				number: 21,
				action: "terminate",
				description: "User interruption with CTRL-BREAK",
				standard: "other",
			},
			{
				name: "SIGTTOU",
				number: 22,
				action: "pause",
				description: "Background process cannot write to terminal output",
				standard: "posix",
			},
			{
				name: "SIGURG",
				number: 23,
				action: "ignore",
				description: "Socket received out-of-band data",
				standard: "bsd",
			},
			{
				name: "SIGXCPU",
				number: 24,
				action: "core",
				description: "Process timed out",
				standard: "bsd",
			},
			{
				name: "SIGXFSZ",
				number: 25,
				action: "core",
				description: "File too big",
				standard: "bsd",
			},
			{
				name: "SIGVTALRM",
				number: 26,
				action: "terminate",
				description: "Timeout or timer",
				standard: "bsd",
			},
			{
				name: "SIGPROF",
				number: 27,
				action: "terminate",
				description: "Timeout or timer",
				standard: "bsd",
			},
			{
				name: "SIGWINCH",
				number: 28,
				action: "ignore",
				description: "Terminal window size changed",
				standard: "bsd",
			},
			{
				name: "SIGIO",
				number: 29,
				action: "terminate",
				description: "I/O is available",
				standard: "other",
			},
			{
				name: "SIGPOLL",
				number: 29,
				action: "terminate",
				description: "Watched event",
				standard: "other",
			},
			{
				name: "SIGINFO",
				number: 29,
				action: "ignore",
				description: "Request for process information",
				standard: "other",
			},
			{
				name: "SIGPWR",
				number: 30,
				action: "terminate",
				description: "Device running out of power",
				standard: "systemv",
			},
			{
				name: "SIGSYS",
				number: 31,
				action: "core",
				description: "Invalid system call",
				standard: "other",
			},
			{
				name: "SIGUNUSED",
				number: 31,
				action: "terminate",
				description: "Invalid system call",
				standard: "other",
			},
		]
	},
	"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/signals.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["getSignals", () => getSignals])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)")
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/core.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$realtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/realtime.js [app-rsc] (ecmascript)",
			)
		const getSignals = () => {
			const realtimeSignals = (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$realtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getRealtimeSignals"
			])()
			const signals = [
				...__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$core$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"SIGNALS"
				],
				...realtimeSignals,
			].map(normalizeSignal)
			return signals
		}
		const normalizeSignal = ({ name, number: defaultNumber, description, action, forced = false, standard }) => {
			const {
				signals: { [name]: constantSignal },
			} =
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__[
					"constants"
				]
			const supported = constantSignal !== undefined
			const number = supported ? constantSignal : defaultNumber
			return {
				name,
				number,
				description,
				supported,
				action,
				forced,
				standard,
			}
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/main.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["signalsByName", () => signalsByName, "signalsByNumber", () => signalsByNumber])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:os [external] (node:os, cjs)")
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$realtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/realtime.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/human-signals@8.0.1/node_modules/human-signals/build/src/signals.js [app-rsc] (ecmascript)",
			)
		const getSignalsByName = () => {
			const signals = (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getSignals"
			])()
			return Object.fromEntries(signals.map(getSignalByName))
		}
		const getSignalByName = ({ name, number, description, supported, action, forced, standard }) => [
			name,
			{
				name,
				number,
				description,
				supported,
				action,
				forced,
				standard,
			},
		]
		const signalsByName = getSignalsByName()
		const getSignalsByNumber = () => {
			const signals = (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getSignals"
			])()
			const length =
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$human$2d$signals$40$8$2e$0$2e$1$2f$node_modules$2f$human$2d$signals$2f$build$2f$src$2f$realtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"SIGRTMAX"
				] + 1
			const signalsA = Array.from(
				{
					length,
				},
				(value, number) => getSignalByNumber(number, signals),
			)
			return Object.assign({}, ...signalsA)
		}
		const getSignalByNumber = (number, signals) => {
			const signal = findSignalByNumber(number, signals)
			if (signal === undefined) {
				return {}
			}
			const { name, description, supported, action, forced, standard } = signal
			return {
				[number]: {
					name,
					number,
					description,
					supported,
					action,
					forced,
					standard,
				},
			}
		}
		const findSignalByNumber = (number, signals) => {
			const signal = signals.find(
				({ name }) =>
					__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$os__$5b$external$5d$__$28$node$3a$os$2c$__cjs$29$__[
						"constants"
					].signals[name] === number,
			)
			if (signal !== undefined) {
				return signal
			}
			return signals.find((signalA) => signalA.number === number)
		}
		const signalsByNumber = getSignalsByNumber()
	},
	"[project]/Roo-Code/node_modules/.pnpm/strip-final-newline@4.0.0/node_modules/strip-final-newline/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => stripFinalNewline])
		function stripFinalNewline(input) {
			if (typeof input === "string") {
				return stripFinalNewlineString(input)
			}
			if (!(ArrayBuffer.isView(input) && input.BYTES_PER_ELEMENT === 1)) {
				throw new Error("Input must be a string or a Uint8Array")
			}
			return stripFinalNewlineBinary(input)
		}
		const stripFinalNewlineString = (input) =>
			input.at(-1) === LF ? input.slice(0, input.at(-2) === CR ? -2 : -1) : input
		const stripFinalNewlineBinary = (input) =>
			input.at(-1) === LF_BINARY ? input.subarray(0, input.at(-2) === CR_BINARY ? -2 : -1) : input
		const LF = "\n"
		const LF_BINARY = LF.codePointAt(0)
		const CR = "\r"
		const CR_BINARY = CR.codePointAt(0)
	},
	"[project]/Roo-Code/node_modules/.pnpm/is-stream@4.0.1/node_modules/is-stream/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([
			"isDuplexStream",
			() => isDuplexStream,
			"isReadableStream",
			() => isReadableStream,
			"isStream",
			() => isStream,
			"isTransformStream",
			() => isTransformStream,
			"isWritableStream",
			() => isWritableStream,
		])
		function isStream(stream, { checkOpen = true } = {}) {
			return (
				stream !== null &&
				typeof stream === "object" &&
				(stream.writable ||
					stream.readable ||
					!checkOpen ||
					(stream.writable === undefined && stream.readable === undefined)) &&
				typeof stream.pipe === "function"
			)
		}
		function isWritableStream(stream, { checkOpen = true } = {}) {
			return (
				isStream(stream, {
					checkOpen,
				}) &&
				(stream.writable || !checkOpen) &&
				typeof stream.write === "function" &&
				typeof stream.end === "function" &&
				typeof stream.writable === "boolean" &&
				typeof stream.writableObjectMode === "boolean" &&
				typeof stream.destroy === "function" &&
				typeof stream.destroyed === "boolean"
			)
		}
		function isReadableStream(stream, { checkOpen = true } = {}) {
			return (
				isStream(stream, {
					checkOpen,
				}) &&
				(stream.readable || !checkOpen) &&
				typeof stream.read === "function" &&
				typeof stream.readable === "boolean" &&
				typeof stream.readableObjectMode === "boolean" &&
				typeof stream.destroy === "function" &&
				typeof stream.destroyed === "boolean"
			)
		}
		function isDuplexStream(stream, options) {
			return isWritableStream(stream, options) && isReadableStream(stream, options)
		}
		function isTransformStream(stream, options) {
			return isDuplexStream(stream, options) && typeof stream._transform === "function"
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/asyncIterator.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["asyncIterator", () => h])
		const a = Object.getPrototypeOf(
			Object.getPrototypeOf(/* istanbul ignore next */ async function* () {}).prototype,
		)
		class c {
			#t
			#n
			#r = !1
			#e = void 0
			constructor(e, t) {
				;(this.#t = e), (this.#n = t)
			}
			next() {
				const e = () => this.#s()
				return (this.#e = this.#e ? this.#e.then(e, e) : e()), this.#e
			}
			return(e) {
				const t = () => this.#i(e)
				return this.#e ? this.#e.then(t, t) : t()
			}
			async #s() {
				if (this.#r)
					return {
						done: !0,
						value: void 0,
					}
				let e
				try {
					e = await this.#t.read()
				} catch (t) {
					throw ((this.#e = void 0), (this.#r = !0), this.#t.releaseLock(), t)
				}
				return e.done && ((this.#e = void 0), (this.#r = !0), this.#t.releaseLock()), e
			}
			async #i(e) {
				if (this.#r)
					return {
						done: !0,
						value: e,
					}
				if (((this.#r = !0), !this.#n)) {
					const t = this.#t.cancel(e)
					return (
						this.#t.releaseLock(),
						await t,
						{
							done: !0,
							value: e,
						}
					)
				}
				return (
					this.#t.releaseLock(),
					{
						done: !0,
						value: e,
					}
				)
			}
		}
		const n = Symbol()
		function i() {
			return this[n].next()
		}
		Object.defineProperty(i, "name", {
			value: "next",
		})
		function o(r) {
			return this[n].return(r)
		}
		Object.defineProperty(o, "name", {
			value: "return",
		})
		const u = Object.create(a, {
			next: {
				enumerable: !0,
				configurable: !0,
				writable: !0,
				value: i,
			},
			return: {
				enumerable: !0,
				configurable: !0,
				writable: !0,
				value: o,
			},
		})
		function h({ preventCancel: r = !1 } = {}) {
			const e = this.getReader(),
				t = new c(e, r),
				s = Object.create(u)
			return (s[n] = t), s
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/fromAnyIterable.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["fromAnyIterable", () => c])
		function c(n) {
			const t = a(n)
			return new ReadableStream(
				{
					async pull(e) {
						const { value: r, done: o } = await t.next()
						o ? e.close() : e.enqueue(r)
					},
					async cancel(e) {
						if (typeof t.return == "function" && typeof (await t.return(e)) != "object")
							throw new TypeError("return() fulfills with a non-object.")
						return e
					},
				},
				new CountQueuingStrategy({
					highWaterMark: 0,
				}),
			)
		}
		function a(n) {
			let t = n[Symbol.asyncIterator]?.bind(n)
			if (t === void 0) {
				const r = n[Symbol.iterator](),
					o = {
						[Symbol.iterator]: () => r,
					}
				t = async function* () {
					return yield* o
				}
			}
			return t()
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/index.js [app-rsc] (ecmascript) <locals>",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f40$sec$2d$ant$2b$readable$2d$stream$40$0$2e$4$2e$1$2f$node_modules$2f40$sec$2d$ant$2f$readable$2d$stream$2f$dist$2f$ponyfill$2f$asyncIterator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/asyncIterator.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f40$sec$2d$ant$2b$readable$2d$stream$40$0$2e$4$2e$1$2f$node_modules$2f40$sec$2d$ant$2f$readable$2d$stream$2f$dist$2f$ponyfill$2f$fromAnyIterable$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/fromAnyIterable.js [app-rsc] (ecmascript)",
			)
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/stream.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["getAsyncIterable", () => getAsyncIterable, "nodeImports", () => nodeImports])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$is$2d$stream$40$4$2e$0$2e$1$2f$node_modules$2f$is$2d$stream$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/is-stream@4.0.1/node_modules/is-stream/index.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f40$sec$2d$ant$2b$readable$2d$stream$40$0$2e$4$2e$1$2f$node_modules$2f40$sec$2d$ant$2f$readable$2d$stream$2f$dist$2f$ponyfill$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/index.js [app-rsc] (ecmascript) <locals>",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f40$sec$2d$ant$2b$readable$2d$stream$40$0$2e$4$2e$1$2f$node_modules$2f40$sec$2d$ant$2f$readable$2d$stream$2f$dist$2f$ponyfill$2f$asyncIterator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/@sec-ant+readable-stream@0.4.1/node_modules/@sec-ant/readable-stream/dist/ponyfill/asyncIterator.js [app-rsc] (ecmascript)",
			)
		const getAsyncIterable = (stream) => {
			if (
				(0,
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$is$2d$stream$40$4$2e$0$2e$1$2f$node_modules$2f$is$2d$stream$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"isReadableStream"
				])(stream, {
					checkOpen: false,
				}) &&
				nodeImports.on !== undefined
			) {
				return getStreamIterable(stream)
			}
			if (typeof stream?.[Symbol.asyncIterator] === "function") {
				return stream
			}
			// `ReadableStream[Symbol.asyncIterator]` support is missing in multiple browsers, so we ponyfill it
			if (toString.call(stream) === "[object ReadableStream]") {
				return __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f40$sec$2d$ant$2b$readable$2d$stream$40$0$2e$4$2e$1$2f$node_modules$2f40$sec$2d$ant$2f$readable$2d$stream$2f$dist$2f$ponyfill$2f$asyncIterator$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"asyncIterator"
				].call(stream)
			}
			throw new TypeError("The first argument must be a Readable, a ReadableStream, or an async iterable.")
		}
		const { toString } = Object.prototype
		// The default iterable for Node.js streams does not allow for multiple readers at once, so we re-implement it
		const getStreamIterable = async function* (stream) {
			const controller = new AbortController()
			const state = {}
			handleStreamEnd(stream, controller, state)
			try {
				for await (const [chunk] of nodeImports.on(stream, "data", {
					signal: controller.signal,
				})) {
					yield chunk
				}
			} catch (error) {
				// Stream failure, for example due to `stream.destroy(error)`
				if (state.error !== undefined) {
					throw state.error
					// `error` event directly emitted on stream
				} else if (!controller.signal.aborted) {
					throw error
					// Otherwise, stream completed successfully
				}
				// The `finally` block also runs when the caller throws, for example due to the `maxBuffer` option
			} finally {
				stream.destroy()
			}
		}
		const handleStreamEnd = async (stream, controller, state) => {
			try {
				await nodeImports.finished(stream, {
					cleanup: true,
					readable: true,
					writable: false,
					error: false,
				})
			} catch (error) {
				state.error = error
			} finally {
				controller.abort()
			}
		}
		const nodeImports = {}
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/contents.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["MaxBufferError", () => MaxBufferError, "getStreamContents", () => getStreamContents])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/stream.js [app-rsc] (ecmascript)",
			)
		const getStreamContents = async (
			stream,
			{ init, convertChunk, getSize, truncateChunk, addChunk, getFinalChunk, finalize },
			{ maxBuffer = Number.POSITIVE_INFINITY } = {},
		) => {
			const asyncIterable = (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$stream$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getAsyncIterable"
			])(stream)
			const state = init()
			state.length = 0
			try {
				for await (const chunk of asyncIterable) {
					const chunkType = getChunkType(chunk)
					const convertedChunk = convertChunk[chunkType](chunk, state)
					appendChunk({
						convertedChunk,
						state,
						getSize,
						truncateChunk,
						addChunk,
						maxBuffer,
					})
				}
				appendFinalChunk({
					state,
					convertChunk,
					getSize,
					truncateChunk,
					addChunk,
					getFinalChunk,
					maxBuffer,
				})
				return finalize(state)
			} catch (error) {
				const normalizedError = typeof error === "object" && error !== null ? error : new Error(error)
				normalizedError.bufferedData = finalize(state)
				throw normalizedError
			}
		}
		const appendFinalChunk = ({ state, getSize, truncateChunk, addChunk, getFinalChunk, maxBuffer }) => {
			const convertedChunk = getFinalChunk(state)
			if (convertedChunk !== undefined) {
				appendChunk({
					convertedChunk,
					state,
					getSize,
					truncateChunk,
					addChunk,
					maxBuffer,
				})
			}
		}
		const appendChunk = ({ convertedChunk, state, getSize, truncateChunk, addChunk, maxBuffer }) => {
			const chunkSize = getSize(convertedChunk)
			const newLength = state.length + chunkSize
			if (newLength <= maxBuffer) {
				addNewChunk(convertedChunk, state, addChunk, newLength)
				return
			}
			const truncatedChunk = truncateChunk(convertedChunk, maxBuffer - state.length)
			if (truncatedChunk !== undefined) {
				addNewChunk(truncatedChunk, state, addChunk, maxBuffer)
			}
			throw new MaxBufferError()
		}
		const addNewChunk = (convertedChunk, state, addChunk, newLength) => {
			state.contents = addChunk(convertedChunk, state, newLength)
			state.length = newLength
		}
		const getChunkType = (chunk) => {
			const typeOfChunk = typeof chunk
			if (typeOfChunk === "string") {
				return "string"
			}
			if (typeOfChunk !== "object" || chunk === null) {
				return "others"
			}
			if (globalThis.Buffer?.isBuffer(chunk)) {
				return "buffer"
			}
			const prototypeName = objectToString.call(chunk)
			if (prototypeName === "[object ArrayBuffer]") {
				return "arrayBuffer"
			}
			if (prototypeName === "[object DataView]") {
				return "dataView"
			}
			if (
				Number.isInteger(chunk.byteLength) &&
				Number.isInteger(chunk.byteOffset) &&
				objectToString.call(chunk.buffer) === "[object ArrayBuffer]"
			) {
				return "typedArray"
			}
			return "others"
		}
		const { toString: objectToString } = Object.prototype
		class MaxBufferError extends Error {
			name = "MaxBufferError"
			constructor() {
				super("maxBuffer exceeded")
			}
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/utils.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([
			"getContentsProperty",
			() => getContentsProperty,
			"getLengthProperty",
			() => getLengthProperty,
			"identity",
			() => identity,
			"noop",
			() => noop,
			"throwObjectStream",
			() => throwObjectStream,
		])
		const identity = (value) => value
		const noop = () => undefined
		const getContentsProperty = ({ contents }) => contents
		const throwObjectStream = (chunk) => {
			throw new Error(`Streams in object mode are not supported: ${String(chunk)}`)
		}
		const getLengthProperty = (convertedChunk) => convertedChunk.length
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/string.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["getStreamAsString", () => getStreamAsString])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$contents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/contents.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/utils.js [app-rsc] (ecmascript)",
			)
		async function getStreamAsString(stream, options) {
			return (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$contents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getStreamContents"
			])(stream, stringMethods, options)
		}
		const initString = () => ({
			contents: "",
			textDecoder: new TextDecoder(),
		})
		const useTextDecoder = (chunk, { textDecoder }) =>
			textDecoder.decode(chunk, {
				stream: true,
			})
		const addStringChunk = (convertedChunk, { contents }) => contents + convertedChunk
		const truncateStringChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize)
		const getFinalStringChunk = ({ textDecoder }) => {
			const finalChunk = textDecoder.decode()
			return finalChunk === "" ? undefined : finalChunk
		}
		const stringMethods = {
			init: initString,
			convertChunk: {
				string: __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"identity"
				],
				buffer: useTextDecoder,
				arrayBuffer: useTextDecoder,
				dataView: useTextDecoder,
				typedArray: useTextDecoder,
				others: __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"throwObjectStream"
				],
			},
			getSize:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"getLengthProperty"
				],
			truncateChunk: truncateStringChunk,
			addChunk: addStringChunk,
			getFinalChunk: getFinalStringChunk,
			finalize:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"getContentsProperty"
				],
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/string.js [app-rsc] (ecmascript) <export getStreamAsString as default>",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s([
			"default",
			() =>
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"getStreamAsString"
				],
		])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$string$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/string.js [app-rsc] (ecmascript)",
			)
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/array-buffer.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["getStreamAsArrayBuffer", () => getStreamAsArrayBuffer])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$contents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/contents.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/utils.js [app-rsc] (ecmascript)",
			)
		async function getStreamAsArrayBuffer(stream, options) {
			return (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$contents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getStreamContents"
			])(stream, arrayBufferMethods, options)
		}
		const initArrayBuffer = () => ({
			contents: new ArrayBuffer(0),
		})
		const useTextEncoder = (chunk) => textEncoder.encode(chunk)
		const textEncoder = new TextEncoder()
		const useUint8Array = (chunk) => new Uint8Array(chunk)
		const useUint8ArrayWithOffset = (chunk) => new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength)
		const truncateArrayBufferChunk = (convertedChunk, chunkSize) => convertedChunk.slice(0, chunkSize)
		// `contents` is an increasingly growing `Uint8Array`.
		const addArrayBufferChunk = (convertedChunk, { contents, length: previousLength }, length) => {
			const newContents = hasArrayBufferResize()
				? resizeArrayBuffer(contents, length)
				: resizeArrayBufferSlow(contents, length)
			new Uint8Array(newContents).set(convertedChunk, previousLength)
			return newContents
		}
		// Without `ArrayBuffer.resize()`, `contents` size is always a power of 2.
		// This means its last bytes are zeroes (not stream data), which need to be
		// trimmed at the end with `ArrayBuffer.slice()`.
		const resizeArrayBufferSlow = (contents, length) => {
			if (length <= contents.byteLength) {
				return contents
			}
			const arrayBuffer = new ArrayBuffer(getNewContentsLength(length))
			new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0)
			return arrayBuffer
		}
		// With `ArrayBuffer.resize()`, `contents` size matches exactly the size of
		// the stream data. It does not include extraneous zeroes to trim at the end.
		// The underlying `ArrayBuffer` does allocate a number of bytes that is a power
		// of 2, but those bytes are only visible after calling `ArrayBuffer.resize()`.
		const resizeArrayBuffer = (contents, length) => {
			if (length <= contents.maxByteLength) {
				contents.resize(length)
				return contents
			}
			const arrayBuffer = new ArrayBuffer(length, {
				maxByteLength: getNewContentsLength(length),
			})
			new Uint8Array(arrayBuffer).set(new Uint8Array(contents), 0)
			return arrayBuffer
		}
		// Retrieve the closest `length` that is both >= and a power of 2
		const getNewContentsLength = (length) => SCALE_FACTOR ** Math.ceil(Math.log(length) / Math.log(SCALE_FACTOR))
		const SCALE_FACTOR = 2
		const finalizeArrayBuffer = ({ contents, length }) =>
			hasArrayBufferResize() ? contents : contents.slice(0, length)
		// `ArrayBuffer.slice()` is slow. When `ArrayBuffer.resize()` is available
		// (Node >=20.0.0, Safari >=16.4 and Chrome), we can use it instead.
		// eslint-disable-next-line no-warning-comments
		// TODO: remove after dropping support for Node 20.
		// eslint-disable-next-line no-warning-comments
		// TODO: use `ArrayBuffer.transferToFixedLength()` instead once it is available
		const hasArrayBufferResize = () => "resize" in ArrayBuffer.prototype
		const arrayBufferMethods = {
			init: initArrayBuffer,
			convertChunk: {
				string: useTextEncoder,
				buffer: useUint8Array,
				arrayBuffer: useUint8Array,
				dataView: useUint8ArrayWithOffset,
				typedArray: useUint8ArrayWithOffset,
				others: __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"throwObjectStream"
				],
			},
			getSize:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"getLengthProperty"
				],
			truncateChunk: truncateArrayBufferChunk,
			addChunk: addArrayBufferChunk,
			getFinalChunk:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"noop"
				],
			finalize: finalizeArrayBuffer,
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/array.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["getStreamAsArray", () => getStreamAsArray])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$contents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/contents.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/get-stream@9.0.1/node_modules/get-stream/source/utils.js [app-rsc] (ecmascript)",
			)
		async function getStreamAsArray(stream, options) {
			return (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$contents$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getStreamContents"
			])(stream, arrayMethods, options)
		}
		const initArray = () => ({
			contents: [],
		})
		const increment = () => 1
		const addArrayChunk = (convertedChunk, { contents }) => {
			contents.push(convertedChunk)
			return contents
		}
		const arrayMethods = {
			init: initArray,
			convertChunk: {
				string: __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"identity"
				],
				buffer: __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"identity"
				],
				arrayBuffer:
					__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
						"identity"
					],
				dataView:
					__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
						"identity"
					],
				typedArray:
					__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
						"identity"
					],
				others: __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"identity"
				],
			},
			getSize: increment,
			truncateChunk:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"noop"
				],
			addChunk: addArrayChunk,
			getFinalChunk:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"noop"
				],
			finalize:
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$get$2d$stream$40$9$2e$0$2e$1$2f$node_modules$2f$get$2d$stream$2f$source$2f$utils$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"getContentsProperty"
				],
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/parse-ms@4.0.0/node_modules/parse-ms/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => parseMilliseconds])
		const toZeroIfInfinity = (value) => (Number.isFinite(value) ? value : 0)
		function parseNumber(milliseconds) {
			return {
				days: Math.trunc(milliseconds / 86_400_000),
				hours: Math.trunc((milliseconds / 3_600_000) % 24),
				minutes: Math.trunc((milliseconds / 60_000) % 60),
				seconds: Math.trunc((milliseconds / 1000) % 60),
				milliseconds: Math.trunc(milliseconds % 1000),
				microseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1000) % 1000),
				nanoseconds: Math.trunc(toZeroIfInfinity(milliseconds * 1e6) % 1000),
			}
		}
		function parseBigint(milliseconds) {
			return {
				days: milliseconds / 86_400_000n,
				hours: (milliseconds / 3_600_000n) % 24n,
				minutes: (milliseconds / 60_000n) % 60n,
				seconds: (milliseconds / 1000n) % 60n,
				milliseconds: milliseconds % 1000n,
				microseconds: 0n,
				nanoseconds: 0n,
			}
		}
		function parseMilliseconds(milliseconds) {
			switch (typeof milliseconds) {
				case "number": {
					if (Number.isFinite(milliseconds)) {
						return parseNumber(milliseconds)
					}
					break
				}
				case "bigint": {
					return parseBigint(milliseconds)
				}
			}
			throw new TypeError("Expected a finite number or bigint")
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/pretty-ms@9.2.0/node_modules/pretty-ms/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => prettyMilliseconds])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$parse$2d$ms$40$4$2e$0$2e$0$2f$node_modules$2f$parse$2d$ms$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/parse-ms@4.0.0/node_modules/parse-ms/index.js [app-rsc] (ecmascript)",
			)
		const isZero = (value) => value === 0 || value === 0n
		const pluralize = (word, count) => (count === 1 || count === 1n ? word : `${word}s`)
		const SECOND_ROUNDING_EPSILON = 0.000_000_1
		const ONE_DAY_IN_MILLISECONDS = 24n * 60n * 60n * 1000n
		function prettyMilliseconds(milliseconds, options) {
			const isBigInt = typeof milliseconds === "bigint"
			if (!isBigInt && !Number.isFinite(milliseconds)) {
				throw new TypeError("Expected a finite number or bigint")
			}
			options = {
				...options,
			}
			const sign = milliseconds < 0 ? "-" : ""
			milliseconds = milliseconds < 0 ? -milliseconds : milliseconds // Cannot use `Math.abs()` because of BigInt support.
			if (options.colonNotation) {
				options.compact = false
				options.formatSubMilliseconds = false
				options.separateMilliseconds = false
				options.verbose = false
			}
			if (options.compact) {
				options.unitCount = 1
				options.secondsDecimalDigits = 0
				options.millisecondsDecimalDigits = 0
			}
			let result = []
			const floorDecimals = (value, decimalDigits) => {
				const flooredInterimValue = Math.floor(value * 10 ** decimalDigits + SECOND_ROUNDING_EPSILON)
				const flooredValue = Math.round(flooredInterimValue) / 10 ** decimalDigits
				return flooredValue.toFixed(decimalDigits)
			}
			const add = (value, long, short, valueString) => {
				if (
					(result.length === 0 || !options.colonNotation) &&
					isZero(value) &&
					!(options.colonNotation && short === "m")
				) {
					return
				}
				valueString ??= String(value)
				if (options.colonNotation) {
					const wholeDigits = valueString.includes(".")
						? valueString.split(".")[0].length
						: valueString.length
					const minLength = result.length > 0 ? 2 : 1
					valueString = "0".repeat(Math.max(0, minLength - wholeDigits)) + valueString
				} else {
					valueString += options.verbose ? " " + pluralize(long, value) : short
				}
				result.push(valueString)
			}
			const parsed = (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$parse$2d$ms$40$4$2e$0$2e$0$2f$node_modules$2f$parse$2d$ms$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"default"
			])(milliseconds)
			const days = BigInt(parsed.days)
			if (options.hideYearAndDays) {
				add(BigInt(days) * 24n + BigInt(parsed.hours), "hour", "h")
			} else {
				if (options.hideYear) {
					add(days, "day", "d")
				} else {
					add(days / 365n, "year", "y")
					add(days % 365n, "day", "d")
				}
				add(Number(parsed.hours), "hour", "h")
			}
			add(Number(parsed.minutes), "minute", "m")
			if (!options.hideSeconds) {
				if (
					options.separateMilliseconds ||
					options.formatSubMilliseconds ||
					(!options.colonNotation && milliseconds < 1000)
				) {
					const seconds = Number(parsed.seconds)
					const milliseconds = Number(parsed.milliseconds)
					const microseconds = Number(parsed.microseconds)
					const nanoseconds = Number(parsed.nanoseconds)
					add(seconds, "second", "s")
					if (options.formatSubMilliseconds) {
						add(milliseconds, "millisecond", "ms")
						add(microseconds, "microsecond", "µs")
						add(nanoseconds, "nanosecond", "ns")
					} else {
						const millisecondsAndBelow = milliseconds + microseconds / 1000 + nanoseconds / 1e6
						const millisecondsDecimalDigits =
							typeof options.millisecondsDecimalDigits === "number"
								? options.millisecondsDecimalDigits
								: 0
						const roundedMilliseconds =
							millisecondsAndBelow >= 1
								? Math.round(millisecondsAndBelow)
								: Math.ceil(millisecondsAndBelow)
						const millisecondsString = millisecondsDecimalDigits
							? millisecondsAndBelow.toFixed(millisecondsDecimalDigits)
							: roundedMilliseconds
						add(Number.parseFloat(millisecondsString), "millisecond", "ms", millisecondsString)
					}
				} else {
					const seconds =
						((isBigInt ? Number(milliseconds % ONE_DAY_IN_MILLISECONDS) : milliseconds) / 1000) % 60
					const secondsDecimalDigits =
						typeof options.secondsDecimalDigits === "number" ? options.secondsDecimalDigits : 1
					const secondsFixed = floorDecimals(seconds, secondsDecimalDigits)
					const secondsString = options.keepDecimalsOnWholeSeconds
						? secondsFixed
						: secondsFixed.replace(/\.0+$/, "")
					add(Number.parseFloat(secondsString), "second", "s", secondsString)
				}
			}
			if (result.length === 0) {
				return sign + "0" + (options.verbose ? " milliseconds" : "ms")
			}
			const separator = options.colonNotation ? ":" : " "
			if (typeof options.unitCount === "number") {
				result = result.slice(0, Math.max(options.unitCount, 1))
			}
			return sign + result.join(separator)
		}
	},
	"[project]/Roo-Code/node_modules/.pnpm/@sindresorhus+merge-streams@4.0.0/node_modules/@sindresorhus/merge-streams/index.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => mergeStreams])
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:events [external] (node:events, cjs)")
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:stream [external] (node:stream, cjs)")
		var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream$2f$promises__$5b$external$5d$__$28$node$3a$stream$2f$promises$2c$__cjs$29$__ =
			__turbopack_context__.i("[externals]/node:stream/promises [external] (node:stream/promises, cjs)")
		function mergeStreams(streams) {
			if (!Array.isArray(streams)) {
				throw new TypeError(`Expected an array, got \`${typeof streams}\`.`)
			}
			for (const stream of streams) {
				validateStream(stream)
			}
			const objectMode = streams.some(({ readableObjectMode }) => readableObjectMode)
			const highWaterMark = getHighWaterMark(streams, objectMode)
			const passThroughStream = new MergedStream({
				objectMode,
				writableHighWaterMark: highWaterMark,
				readableHighWaterMark: highWaterMark,
			})
			for (const stream of streams) {
				passThroughStream.add(stream)
			}
			return passThroughStream
		}
		const getHighWaterMark = (streams, objectMode) => {
			if (streams.length === 0) {
				return (0,
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__[
					"getDefaultHighWaterMark"
				])(objectMode)
			}
			const highWaterMarks = streams
				.filter(({ readableObjectMode }) => readableObjectMode === objectMode)
				.map(({ readableHighWaterMark }) => readableHighWaterMark)
			return Math.max(...highWaterMarks)
		}
		class MergedStream extends __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream__$5b$external$5d$__$28$node$3a$stream$2c$__cjs$29$__[
			"PassThrough"
		] {
			#streams = new Set([])
			#ended = new Set([])
			#aborted = new Set([])
			#onFinished
			#unpipeEvent = Symbol("unpipe")
			#streamPromises = new WeakMap()
			add(stream) {
				validateStream(stream)
				if (this.#streams.has(stream)) {
					return
				}
				this.#streams.add(stream)
				this.#onFinished ??= onMergedStreamFinished(this, this.#streams, this.#unpipeEvent)
				const streamPromise = endWhenStreamsDone({
					passThroughStream: this,
					stream,
					streams: this.#streams,
					ended: this.#ended,
					aborted: this.#aborted,
					onFinished: this.#onFinished,
					unpipeEvent: this.#unpipeEvent,
				})
				this.#streamPromises.set(stream, streamPromise)
				stream.pipe(this, {
					end: false,
				})
			}
			async remove(stream) {
				validateStream(stream)
				if (!this.#streams.has(stream)) {
					return false
				}
				const streamPromise = this.#streamPromises.get(stream)
				if (streamPromise === undefined) {
					return false
				}
				this.#streamPromises.delete(stream)
				stream.unpipe(this)
				await streamPromise
				return true
			}
		}
		const onMergedStreamFinished = async (passThroughStream, streams, unpipeEvent) => {
			updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_COUNT)
			const controller = new AbortController()
			try {
				await Promise.race([
					onMergedStreamEnd(passThroughStream, controller),
					onInputStreamsUnpipe(passThroughStream, streams, unpipeEvent, controller),
				])
			} finally {
				controller.abort()
				updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_COUNT)
			}
		}
		const onMergedStreamEnd = async (passThroughStream, { signal }) => {
			try {
				await (0,
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream$2f$promises__$5b$external$5d$__$28$node$3a$stream$2f$promises$2c$__cjs$29$__[
					"finished"
				])(passThroughStream, {
					signal,
					cleanup: true,
				})
			} catch (error) {
				errorOrAbortStream(passThroughStream, error)
				throw error
			}
		}
		const onInputStreamsUnpipe = async (passThroughStream, streams, unpipeEvent, { signal }) => {
			for await (const [unpipedStream] of (0,
			__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__[
				"on"
			])(passThroughStream, "unpipe", {
				signal,
			})) {
				if (streams.has(unpipedStream)) {
					unpipedStream.emit(unpipeEvent)
				}
			}
		}
		const validateStream = (stream) => {
			if (typeof stream?.pipe !== "function") {
				throw new TypeError(`Expected a readable stream, got: \`${typeof stream}\`.`)
			}
		}
		const endWhenStreamsDone = async ({
			passThroughStream,
			stream,
			streams,
			ended,
			aborted,
			onFinished,
			unpipeEvent,
		}) => {
			updateMaxListeners(passThroughStream, PASSTHROUGH_LISTENERS_PER_STREAM)
			const controller = new AbortController()
			try {
				await Promise.race([
					afterMergedStreamFinished(onFinished, stream, controller),
					onInputStreamEnd({
						passThroughStream,
						stream,
						streams,
						ended,
						aborted,
						controller,
					}),
					onInputStreamUnpipe({
						stream,
						streams,
						ended,
						aborted,
						unpipeEvent,
						controller,
					}),
				])
			} finally {
				controller.abort()
				updateMaxListeners(passThroughStream, -PASSTHROUGH_LISTENERS_PER_STREAM)
			}
			if (streams.size > 0 && streams.size === ended.size + aborted.size) {
				if (ended.size === 0 && aborted.size > 0) {
					abortStream(passThroughStream)
				} else {
					endStream(passThroughStream)
				}
			}
		}
		const afterMergedStreamFinished = async (onFinished, stream, { signal }) => {
			try {
				await onFinished
				if (!signal.aborted) {
					abortStream(stream)
				}
			} catch (error) {
				if (!signal.aborted) {
					errorOrAbortStream(stream, error)
				}
			}
		}
		const onInputStreamEnd = async ({
			passThroughStream,
			stream,
			streams,
			ended,
			aborted,
			controller: { signal },
		}) => {
			try {
				await (0,
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$stream$2f$promises__$5b$external$5d$__$28$node$3a$stream$2f$promises$2c$__cjs$29$__[
					"finished"
				])(stream, {
					signal,
					cleanup: true,
					readable: true,
					writable: false,
				})
				if (streams.has(stream)) {
					ended.add(stream)
				}
			} catch (error) {
				if (signal.aborted || !streams.has(stream)) {
					return
				}
				if (isAbortError(error)) {
					aborted.add(stream)
				} else {
					errorStream(passThroughStream, error)
				}
			}
		}
		const onInputStreamUnpipe = async ({
			stream,
			streams,
			ended,
			aborted,
			unpipeEvent,
			controller: { signal },
		}) => {
			await (0,
			__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__[
				"once"
			])(stream, unpipeEvent, {
				signal,
			})
			if (!stream.readable) {
				return (0,
				__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$events__$5b$external$5d$__$28$node$3a$events$2c$__cjs$29$__[
					"once"
				])(signal, "abort", {
					signal,
				})
			}
			streams.delete(stream)
			ended.delete(stream)
			aborted.delete(stream)
		}
		const endStream = (stream) => {
			if (stream.writable) {
				stream.end()
			}
		}
		const errorOrAbortStream = (stream, error) => {
			if (isAbortError(error)) {
				abortStream(stream)
			} else {
				errorStream(stream, error)
			}
		}
		// This is the error thrown by `finished()` on `stream.destroy()`
		const isAbortError = (error) => error?.code === "ERR_STREAM_PREMATURE_CLOSE"
		const abortStream = (stream) => {
			if (stream.readable || stream.writable) {
				stream.destroy()
			}
		}
		// `stream.destroy(error)` crashes the process with `uncaughtException` if no `error` event listener exists on `stream`.
		// We take care of error handling on user behalf, so we do not want this to happen.
		const errorStream = (stream, error) => {
			if (!stream.destroyed) {
				stream.once("error", noop)
				stream.destroy(error)
			}
		}
		const noop = () => {}
		const updateMaxListeners = (passThroughStream, increment) => {
			const maxListeners = passThroughStream.getMaxListeners()
			if (maxListeners !== 0 && maxListeners !== Number.POSITIVE_INFINITY) {
				passThroughStream.setMaxListeners(maxListeners + increment)
			}
		}
		// Number of times `passThroughStream.on()` is called regardless of streams:
		//  - once due to `finished(passThroughStream)`
		//  - once due to `on(passThroughStream)`
		const PASSTHROUGH_LISTENERS_COUNT = 2
		// Number of times `passThroughStream.on()` is called per stream:
		//  - once due to `stream.pipe(passThroughStream)`
		const PASSTHROUGH_LISTENERS_PER_STREAM = 1
	},
	"[project]/Roo-Code/node_modules/.pnpm/signal-exit@4.1.0/node_modules/signal-exit/dist/mjs/signals.js [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		/**
		 * This is not the set of all possible signals.
		 *
		 * It IS, however, the set of all signals that trigger
		 * an exit on either Linux or BSD systems.  Linux is a
		 * superset of the signal names supported on BSD, and
		 * the unknown signals just fail to register, so we can
		 * catch that easily enough.
		 *
		 * Windows signals are a different set, since there are
		 * signals that terminate Windows processes, but don't
		 * terminate (or don't even exist) on Posix systems.
		 *
		 * Don't bother with SIGKILL.  It's uncatchable, which
		 * means that we can't fire any callbacks anyway.
		 *
		 * If a user does happen to register a handler on a non-
		 * fatal signal like SIGWINCH or something, and then
		 * exit, it'll end up firing `process.emit('exit')`, so
		 * the handler will be fired anyway.
		 *
		 * SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
		 * artificially, inherently leave the process in a
		 * state from which it is not safe to try and enter JS
		 * listeners.
		 */ __turbopack_context__.s(["signals", () => signals])
		const signals = []
		signals.push("SIGHUP", "SIGINT", "SIGTERM")
		if (("TURBOPACK compile-time truthy", 1)) {
			signals.push(
				"SIGALRM",
				"SIGABRT",
				"SIGVTALRM",
				"SIGXCPU",
				"SIGXFSZ",
				"SIGUSR2",
				"SIGTRAP",
				"SIGSYS",
				"SIGQUIT",
				"SIGIOT",
			)
		}
		if (
			("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
		);
		//# sourceMappingURL=signals.js.map
	},
	"[project]/Roo-Code/node_modules/.pnpm/signal-exit@4.1.0/node_modules/signal-exit/dist/mjs/index.js [app-rsc] (ecmascript) <locals>",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["load", () => load, "onExit", () => onExit, "unload", () => unload])
		// Note: since nyc uses this module to output coverage, any lines
		// that are in the direct sync flow of nyc's outputCoverage are
		// ignored, since we can never get coverage for them.
		// grab a reference to node's real process object right away
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$signal$2d$exit$40$4$2e$1$2e$0$2f$node_modules$2f$signal$2d$exit$2f$dist$2f$mjs$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/signal-exit@4.1.0/node_modules/signal-exit/dist/mjs/signals.js [app-rsc] (ecmascript)",
			)
		const processOk = (process) =>
			!!process &&
			typeof process === "object" &&
			typeof process.removeListener === "function" &&
			typeof process.emit === "function" &&
			typeof process.reallyExit === "function" &&
			typeof process.listeners === "function" &&
			typeof process.kill === "function" &&
			typeof process.pid === "number" &&
			typeof process.on === "function"
		const kExitEmitter = Symbol.for("signal-exit emitter")
		const global = globalThis
		const ObjectDefineProperty = Object.defineProperty.bind(Object)
		// teeny special purpose ee
		class Emitter {
			emitted = {
				afterExit: false,
				exit: false,
			}
			listeners = {
				afterExit: [],
				exit: [],
			}
			count = 0
			id = Math.random()
			constructor() {
				if (global[kExitEmitter]) {
					return global[kExitEmitter]
				}
				ObjectDefineProperty(global, kExitEmitter, {
					value: this,
					writable: false,
					enumerable: false,
					configurable: false,
				})
			}
			on(ev, fn) {
				this.listeners[ev].push(fn)
			}
			removeListener(ev, fn) {
				const list = this.listeners[ev]
				const i = list.indexOf(fn)
				/* c8 ignore start */ if (i === -1) {
					return
				}
				/* c8 ignore stop */ if (i === 0 && list.length === 1) {
					list.length = 0
				} else {
					list.splice(i, 1)
				}
			}
			emit(ev, code, signal) {
				if (this.emitted[ev]) {
					return false
				}
				this.emitted[ev] = true
				let ret = false
				for (const fn of this.listeners[ev]) {
					ret = fn(code, signal) === true || ret
				}
				if (ev === "exit") {
					ret = this.emit("afterExit", code, signal) || ret
				}
				return ret
			}
		}
		class SignalExitBase {}
		const signalExitWrap = (handler) => {
			return {
				onExit(cb, opts) {
					return handler.onExit(cb, opts)
				},
				load() {
					return handler.load()
				},
				unload() {
					return handler.unload()
				},
			}
		}
		class SignalExitFallback extends SignalExitBase {
			onExit() {
				return () => {}
			}
			load() {}
			unload() {}
		}
		class SignalExit extends SignalExitBase {
			// "SIGHUP" throws an `ENOSYS` error on Windows,
			// so use a supported signal instead
			/* c8 ignore start */ #hupSig = process.platform === "win32" ? "SIGINT" : "SIGHUP"
			/* c8 ignore stop */ #emitter = new Emitter()
			#process
			#originalProcessEmit
			#originalProcessReallyExit
			#sigListeners = {}
			#loaded = false
			constructor(process) {
				super()
				this.#process = process
				// { <signal>: <listener fn>, ... }
				this.#sigListeners = {}
				for (const sig of __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$signal$2d$exit$40$4$2e$1$2e$0$2f$node_modules$2f$signal$2d$exit$2f$dist$2f$mjs$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"signals"
				]) {
					this.#sigListeners[sig] = () => {
						// If there are no other listeners, an exit is coming!
						// Simplest way: remove us and then re-send the signal.
						// We know that this will kill the process, so we can
						// safely emit now.
						const listeners = this.#process.listeners(sig)
						let { count } = this.#emitter
						// This is a workaround for the fact that signal-exit v3 and signal
						// exit v4 are not aware of each other, and each will attempt to let
						// the other handle it, so neither of them do. To correct this, we
						// detect if we're the only handler *except* for previous versions
						// of signal-exit, and increment by the count of listeners it has
						// created.
						/* c8 ignore start */ const p = process
						if (
							typeof p.__signal_exit_emitter__ === "object" &&
							typeof p.__signal_exit_emitter__.count === "number"
						) {
							count += p.__signal_exit_emitter__.count
						}
						/* c8 ignore stop */ if (listeners.length === count) {
							this.unload()
							const ret = this.#emitter.emit("exit", null, sig)
							/* c8 ignore start */ const s = sig === "SIGHUP" ? this.#hupSig : sig
							if (!ret) process.kill(process.pid, s)
							/* c8 ignore stop */
						}
					}
				}
				this.#originalProcessReallyExit = process.reallyExit
				this.#originalProcessEmit = process.emit
			}
			onExit(cb, opts) {
				/* c8 ignore start */ if (!processOk(this.#process)) {
					return () => {}
				}
				/* c8 ignore stop */ if (this.#loaded === false) {
					this.load()
				}
				const ev = opts?.alwaysLast ? "afterExit" : "exit"
				this.#emitter.on(ev, cb)
				return () => {
					this.#emitter.removeListener(ev, cb)
					if (
						this.#emitter.listeners["exit"].length === 0 &&
						this.#emitter.listeners["afterExit"].length === 0
					) {
						this.unload()
					}
				}
			}
			load() {
				if (this.#loaded) {
					return
				}
				this.#loaded = true
				// This is the number of onSignalExit's that are in play.
				// It's important so that we can count the correct number of
				// listeners on signals, and don't wait for the other one to
				// handle it instead of us.
				this.#emitter.count += 1
				for (const sig of __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$signal$2d$exit$40$4$2e$1$2e$0$2f$node_modules$2f$signal$2d$exit$2f$dist$2f$mjs$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"signals"
				]) {
					try {
						const fn = this.#sigListeners[sig]
						if (fn) this.#process.on(sig, fn)
					} catch (_) {}
				}
				this.#process.emit = (ev, ...a) => {
					return this.#processEmit(ev, ...a)
				}
				this.#process.reallyExit = (code) => {
					return this.#processReallyExit(code)
				}
			}
			unload() {
				if (!this.#loaded) {
					return
				}
				this.#loaded = false
				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$signal$2d$exit$40$4$2e$1$2e$0$2f$node_modules$2f$signal$2d$exit$2f$dist$2f$mjs$2f$signals$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
					"signals"
				].forEach((sig) => {
					const listener = this.#sigListeners[sig]
					/* c8 ignore start */ if (!listener) {
						throw new Error("Listener not defined for signal: " + sig)
					}
					/* c8 ignore stop */ try {
						this.#process.removeListener(sig, listener)
						/* c8 ignore start */
					} catch (_) {}
					/* c8 ignore stop */
				})
				this.#process.emit = this.#originalProcessEmit
				this.#process.reallyExit = this.#originalProcessReallyExit
				this.#emitter.count -= 1
			}
			#processReallyExit(code) {
				/* c8 ignore start */ if (!processOk(this.#process)) {
					return 0
				}
				this.#process.exitCode = code || 0
				/* c8 ignore stop */ this.#emitter.emit("exit", this.#process.exitCode, null)
				return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode)
			}
			#processEmit(ev, ...args) {
				const og = this.#originalProcessEmit
				if (ev === "exit" && processOk(this.#process)) {
					if (typeof args[0] === "number") {
						this.#process.exitCode = args[0]
						/* c8 ignore start */
					}
					/* c8 ignore start */ const ret = og.call(this.#process, ev, ...args)
					/* c8 ignore start */ this.#emitter.emit("exit", this.#process.exitCode, null)
					/* c8 ignore stop */ return ret
				} else {
					return og.call(this.#process, ev, ...args)
				}
			}
		}
		const process = globalThis.process
		const {
			/**
			 * Called when the process is exiting, whether via signal, explicit
			 * exit, or running out of stuff to do.
			 *
			 * If the global process object is not suitable for instrumentation,
			 * then this will be a no-op.
			 *
			 * Returns a function that may be used to unload signal-exit.
			 */ onExit,
			/**
			 * Load the listeners.  Likely you never need to call this, unless
			 * doing a rather deep integration with signal-exit functionality.
			 * Mostly exposed for the benefit of testing.
			 *
			 * @internal
			 */ load,
			/**
			 * Unload the listeners.  Likely you never need to call this, unless
			 * doing a rather deep integration with signal-exit functionality.
			 * Mostly exposed for the benefit of testing.
			 *
			 * @internal
			 */ unload,
		} = signalExitWrap(processOk(process) ? new SignalExit(process) : new SignalExitFallback()) //# sourceMappingURL=index.js.map
	},
]

//# sourceMappingURL=%5Broot-of-the-server%5D__a112e027._.js.map
