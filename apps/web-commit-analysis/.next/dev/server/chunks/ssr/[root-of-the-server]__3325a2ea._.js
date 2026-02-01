module.exports = [
	"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)",
	(__turbopack_context__, module, exports) => {
		const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () =>
			require("next/dist/shared/lib/no-fallback-error.external.js"),
		)

		module.exports = mod
	},
	"[project]/Roo-Code/apps/web-commit-analysis/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)",
	(__turbopack_context__) => {
		__turbopack_context__.n(
			__turbopack_context__.i(
				"[project]/Roo-Code/apps/web-commit-analysis/src/app/layout.tsx [app-rsc] (ecmascript)",
			),
		)
	},
	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx [app-rsc] (ecmascript)",
	(__turbopack_context__) => {
		"use strict"

		__turbopack_context__.s(["default", () => SyncPage, "dynamic", () => dynamic])
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/node_modules/.pnpm/next@16.1.6_@opentelemetry+api@1.9.0_babel-plugin-react-compiler@1.0.0_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)",
			)
		var __TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$apps$2f$web$2d$commit$2d$analysis$2f$src$2f$actions$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ =
			__turbopack_context__.i(
				"[project]/Roo-Code/apps/web-commit-analysis/src/actions/sync.ts [app-rsc] (ecmascript)",
			)
		const dynamic = "force-dynamic"
		async function SyncPage({ searchParams }) {
			const params = await searchParams
			const upstream = params.upstream || "origin/main"
			const local = params.local || "HEAD"
			const maxRisk = parseInt(params.maxRisk || "60", 10)
			const { summary, recommendation } = await (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$apps$2f$web$2d$commit$2d$analysis$2f$src$2f$actions$2f$sync$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"getSyncData"
			])(upstream, local, maxRisk)
			return /*#__PURE__*/ (0,
			__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
				"jsxDEV"
			])(
				"div",
				{
					className: "space-y-6",
					children: [
						/*#__PURE__*/ (0,
						__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
							"jsxDEV"
						])(
							"div",
							{
								className: "flex items-center justify-between",
								children: /*#__PURE__*/ (0,
								__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
									"jsxDEV"
								])(
									"h2",
									{
										className: "text-2xl font-semibold",
										children: "Sync Advisor",
									},
									void 0,
									false,
									{
										fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
										lineNumber: 20,
										columnNumber: 5,
									},
									this,
								),
							},
							void 0,
							false,
							{
								fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
								lineNumber: 19,
								columnNumber: 4,
							},
							this,
						),
						/*#__PURE__*/ (0,
						__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
							"jsxDEV"
						])(
							"div",
							{
								className: "border rounded-lg p-4 space-y-4",
								children: [
									/*#__PURE__*/ (0,
									__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
										"jsxDEV"
									])(
										"h3",
										{
											className: "font-semibold",
											children: "Configuration",
										},
										void 0,
										false,
										{
											fileName:
												"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
											lineNumber: 24,
											columnNumber: 5,
										},
										this,
									),
									/*#__PURE__*/ (0,
									__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
										"jsxDEV"
									])(
										"form",
										{
											className: "grid gap-4 md:grid-cols-4",
											children: [
												/*#__PURE__*/ (0,
												__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
													"jsxDEV"
												])(
													"div",
													{
														children: [
															/*#__PURE__*/ (0,
															__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																"jsxDEV"
															])(
																"label",
																{
																	className:
																		"text-sm text-muted-foreground block mb-1",
																	children: "Upstream",
																},
																void 0,
																false,
																{
																	fileName:
																		"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																	lineNumber: 27,
																	columnNumber: 7,
																},
																this,
															),
															/*#__PURE__*/ (0,
															__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																"jsxDEV"
															])(
																"input",
																{
																	type: "text",
																	name: "upstream",
																	defaultValue: upstream,
																	className:
																		"w-full border rounded px-3 py-2 text-sm",
																},
																void 0,
																false,
																{
																	fileName:
																		"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																	lineNumber: 30,
																	columnNumber: 7,
																},
																this,
															),
														],
													},
													void 0,
													true,
													{
														fileName:
															"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
														lineNumber: 26,
														columnNumber: 6,
													},
													this,
												),
												/*#__PURE__*/ (0,
												__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
													"jsxDEV"
												])(
													"div",
													{
														children: [
															/*#__PURE__*/ (0,
															__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																"jsxDEV"
															])(
																"label",
																{
																	className:
																		"text-sm text-muted-foreground block mb-1",
																	children: "Local",
																},
																void 0,
																false,
																{
																	fileName:
																		"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																	lineNumber: 38,
																	columnNumber: 7,
																},
																this,
															),
															/*#__PURE__*/ (0,
															__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																"jsxDEV"
															])(
																"input",
																{
																	type: "text",
																	name: "local",
																	defaultValue: local,
																	className:
																		"w-full border rounded px-3 py-2 text-sm",
																},
																void 0,
																false,
																{
																	fileName:
																		"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																	lineNumber: 41,
																	columnNumber: 7,
																},
																this,
															),
														],
													},
													void 0,
													true,
													{
														fileName:
															"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
														lineNumber: 37,
														columnNumber: 6,
													},
													this,
												),
												/*#__PURE__*/ (0,
												__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
													"jsxDEV"
												])(
													"div",
													{
														children: [
															/*#__PURE__*/ (0,
															__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																"jsxDEV"
															])(
																"label",
																{
																	className:
																		"text-sm text-muted-foreground block mb-1",
																	children: "Max Risk",
																},
																void 0,
																false,
																{
																	fileName:
																		"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																	lineNumber: 49,
																	columnNumber: 7,
																},
																this,
															),
															/*#__PURE__*/ (0,
															__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																"jsxDEV"
															])(
																"input",
																{
																	type: "number",
																	name: "maxRisk",
																	defaultValue: maxRisk,
																	className:
																		"w-full border rounded px-3 py-2 text-sm",
																},
																void 0,
																false,
																{
																	fileName:
																		"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																	lineNumber: 52,
																	columnNumber: 7,
																},
																this,
															),
														],
													},
													void 0,
													true,
													{
														fileName:
															"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
														lineNumber: 48,
														columnNumber: 6,
													},
													this,
												),
												/*#__PURE__*/ (0,
												__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
													"jsxDEV"
												])(
													"div",
													{
														className: "flex items-end",
														children: /*#__PURE__*/ (0,
														__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
															"jsxDEV"
														])(
															"button",
															{
																type: "submit",
																className:
																	"bg-primary text-primary-foreground px-4 py-2 rounded text-sm",
																children: "Analyze",
															},
															void 0,
															false,
															{
																fileName:
																	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																lineNumber: 60,
																columnNumber: 7,
															},
															this,
														),
													},
													void 0,
													false,
													{
														fileName:
															"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
														lineNumber: 59,
														columnNumber: 6,
													},
													this,
												),
											],
										},
										void 0,
										true,
										{
											fileName:
												"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
											lineNumber: 25,
											columnNumber: 5,
										},
										this,
									),
								],
							},
							void 0,
							true,
							{
								fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
								lineNumber: 23,
								columnNumber: 4,
							},
							this,
						),
						summary &&
							/*#__PURE__*/ (0,
							__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
								"jsxDEV"
							])(
								"div",
								{
									className: "grid gap-6 md:grid-cols-3",
									children: [
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"div",
											{
												className: "border rounded-lg p-4",
												children: [
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															className: "text-3xl font-bold",
															children: summary.behind,
														},
														void 0,
														false,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 73,
															columnNumber: 7,
														},
														this,
													),
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															className: "text-sm text-muted-foreground",
															children: "Commits behind",
														},
														void 0,
														false,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 74,
															columnNumber: 7,
														},
														this,
													),
												],
											},
											void 0,
											true,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 72,
												columnNumber: 6,
											},
											this,
										),
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"div",
											{
												className: "border rounded-lg p-4",
												children: [
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															className: "text-3xl font-bold",
															children: summary.ahead,
														},
														void 0,
														false,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 77,
															columnNumber: 7,
														},
														this,
													),
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															className: "text-sm text-muted-foreground",
															children: "Commits ahead",
														},
														void 0,
														false,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 78,
															columnNumber: 7,
														},
														this,
													),
												],
											},
											void 0,
											true,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 76,
												columnNumber: 6,
											},
											this,
										),
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"div",
											{
												className: "border rounded-lg p-4",
												children: [
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															className: "text-3xl font-bold",
															children: summary.lastSyncDate
																? summary.lastSyncDate.toLocaleDateString()
																: "N/A",
														},
														void 0,
														false,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 81,
															columnNumber: 7,
														},
														this,
													),
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															className: "text-sm text-muted-foreground",
															children: "Last sync",
														},
														void 0,
														false,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 86,
															columnNumber: 7,
														},
														this,
													),
												],
											},
											void 0,
											true,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 80,
												columnNumber: 6,
											},
											this,
										),
									],
								},
								void 0,
								true,
								{
									fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
									lineNumber: 71,
									columnNumber: 5,
								},
								this,
							),
						recommendation &&
							/*#__PURE__*/ (0,
							__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
								"jsxDEV"
							])(
								"div",
								{
									className: "border rounded-lg p-4 space-y-4",
									children: [
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"h3",
											{
												className: "font-semibold",
												children: "Recommendation",
											},
											void 0,
											false,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 93,
												columnNumber: 6,
											},
											this,
										),
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"div",
											{
												className: `p-4 rounded-lg ${recommendation.safeToSync ? "bg-green-50 border border-green-200" : "bg-yellow-50 border border-yellow-200"}`,
												children: recommendation.safeToSync
													? /*#__PURE__*/ (0,
														__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
															"jsxDEV"
														])(
															"div",
															{
																className: "flex items-center gap-2",
																children: [
																	/*#__PURE__*/ (0,
																	__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																		"jsxDEV"
																	])(
																		"span",
																		{
																			className: "text-green-600 text-xl",
																			children: "✓",
																		},
																		void 0,
																		false,
																		{
																			fileName:
																				"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																			lineNumber: 104,
																			columnNumber: 9,
																		},
																		this,
																	),
																	/*#__PURE__*/ (0,
																	__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																		"jsxDEV"
																	])(
																		"span",
																		{
																			className: "font-medium",
																			children: ["Safe to sync to ", upstream],
																		},
																		void 0,
																		true,
																		{
																			fileName:
																				"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																			lineNumber: 105,
																			columnNumber: 9,
																		},
																		this,
																	),
																],
															},
															void 0,
															true,
															{
																fileName:
																	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																lineNumber: 103,
																columnNumber: 8,
															},
															this,
														)
													: /*#__PURE__*/ (0,
														__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
															"jsxDEV"
														])(
															"div",
															{
																className: "space-y-2",
																children: [
																	/*#__PURE__*/ (0,
																	__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																		"jsxDEV"
																	])(
																		"div",
																		{
																			className: "flex items-center gap-2",
																			children: [
																				/*#__PURE__*/ (0,
																				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																					"jsxDEV"
																				])(
																					"span",
																					{
																						className:
																							"text-yellow-600 text-xl",
																						children: "⚠",
																					},
																					void 0,
																					false,
																					{
																						fileName:
																							"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																						lineNumber: 110,
																						columnNumber: 10,
																					},
																					this,
																				),
																				/*#__PURE__*/ (0,
																				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																					"jsxDEV"
																				])(
																					"span",
																					{
																						className: "font-medium",
																						children: [
																							"Consider syncing to ",
																							recommendation.recommendedCommit.slice(
																								0,
																								8,
																							),
																						],
																					},
																					void 0,
																					true,
																					{
																						fileName:
																							"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																						lineNumber: 111,
																						columnNumber: 10,
																					},
																					this,
																				),
																			],
																		},
																		void 0,
																		true,
																		{
																			fileName:
																				"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																			lineNumber: 109,
																			columnNumber: 9,
																		},
																		this,
																	),
																	/*#__PURE__*/ (0,
																	__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																		"jsxDEV"
																	])(
																		"p",
																		{
																			className: "text-sm text-muted-foreground",
																			children:
																				"This limits risk to acceptable levels.",
																		},
																		void 0,
																		false,
																		{
																			fileName:
																				"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																			lineNumber: 115,
																			columnNumber: 9,
																		},
																		this,
																	),
																],
															},
															void 0,
															true,
															{
																fileName:
																	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																lineNumber: 108,
																columnNumber: 8,
															},
															this,
														),
											},
											void 0,
											false,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 95,
												columnNumber: 6,
											},
											this,
										),
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"div",
											{
												className: "grid gap-4 md:grid-cols-4",
												children: [
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															children: [
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-2xl font-bold",
																		children: recommendation.commitCount,
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 124,
																		columnNumber: 8,
																	},
																	this,
																),
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-sm text-muted-foreground",
																		children: "Total commits",
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 125,
																		columnNumber: 8,
																	},
																	this,
																),
															],
														},
														void 0,
														true,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 123,
															columnNumber: 7,
														},
														this,
													),
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															children: [
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-2xl font-bold",
																		children: recommendation.breakdown.features,
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 128,
																		columnNumber: 8,
																	},
																	this,
																),
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-sm text-muted-foreground",
																		children: "Features",
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 129,
																		columnNumber: 8,
																	},
																	this,
																),
															],
														},
														void 0,
														true,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 127,
															columnNumber: 7,
														},
														this,
													),
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															children: [
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-2xl font-bold",
																		children: recommendation.breakdown.fixes,
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 132,
																		columnNumber: 8,
																	},
																	this,
																),
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-sm text-muted-foreground",
																		children: "Fixes",
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 133,
																		columnNumber: 8,
																	},
																	this,
																),
															],
														},
														void 0,
														true,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 131,
															columnNumber: 7,
														},
														this,
													),
													/*#__PURE__*/ (0,
													__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
														"jsxDEV"
													])(
														"div",
														{
															children: [
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-2xl font-bold",
																		children: recommendation.totalRisk.toFixed(1),
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 136,
																		columnNumber: 8,
																	},
																	this,
																),
																/*#__PURE__*/ (0,
																__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																	"jsxDEV"
																])(
																	"div",
																	{
																		className: "text-sm text-muted-foreground",
																		children: "Aggregate risk",
																	},
																	void 0,
																	false,
																	{
																		fileName:
																			"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																		lineNumber: 139,
																		columnNumber: 8,
																	},
																	this,
																),
															],
														},
														void 0,
														true,
														{
															fileName:
																"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
															lineNumber: 135,
															columnNumber: 7,
														},
														this,
													),
												],
											},
											void 0,
											true,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 122,
												columnNumber: 6,
											},
											this,
										),
										recommendation.warnings.length > 0 &&
											/*#__PURE__*/ (0,
											__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
												"jsxDEV"
											])(
												"div",
												{
													className: "space-y-2",
													children: [
														/*#__PURE__*/ (0,
														__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
															"jsxDEV"
														])(
															"h4",
															{
																className: "font-medium text-sm",
																children: "Warnings",
															},
															void 0,
															false,
															{
																fileName:
																	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																lineNumber: 145,
																columnNumber: 8,
															},
															this,
														),
														/*#__PURE__*/ (0,
														__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
															"jsxDEV"
														])(
															"ul",
															{
																className: "space-y-1",
																children: recommendation.warnings.map((warning, i) =>
																	/*#__PURE__*/ (0,
																	__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																		"jsxDEV"
																	])(
																		"li",
																		{
																			className:
																				"text-sm text-muted-foreground flex items-center gap-2",
																			children: [
																				/*#__PURE__*/ (0,
																				__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
																					"jsxDEV"
																				])(
																					"span",
																					{
																						className: "text-yellow-600",
																						children: "⚠",
																					},
																					void 0,
																					false,
																					{
																						fileName:
																							"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																						lineNumber: 149,
																						columnNumber: 11,
																					},
																					this,
																				),
																				warning,
																			],
																		},
																		i,
																		true,
																		{
																			fileName:
																				"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																			lineNumber: 148,
																			columnNumber: 10,
																		},
																		this,
																	),
																),
															},
															void 0,
															false,
															{
																fileName:
																	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
																lineNumber: 146,
																columnNumber: 8,
															},
															this,
														),
													],
												},
												void 0,
												true,
												{
													fileName:
														"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
													lineNumber: 144,
													columnNumber: 7,
												},
												this,
											),
									],
								},
								void 0,
								true,
								{
									fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
									lineNumber: 92,
									columnNumber: 5,
								},
								this,
							),
						!summary &&
							!recommendation &&
							/*#__PURE__*/ (0,
							__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
								"jsxDEV"
							])(
								"div",
								{
									className: "text-center py-12 text-muted-foreground",
									children: [
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"p",
											{
												children: "Unable to analyze sync status.",
											},
											void 0,
											false,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 161,
												columnNumber: 6,
											},
											this,
										),
										/*#__PURE__*/ (0,
										__TURBOPACK__imported__module__$5b$project$5d2f$Roo$2d$Code$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_$40$opentelemetry$2b$api$40$1$2e$9$2e$0_babel$2d$plugin$2d$react$2d$compiler$40$1$2e$0$2e$0_react$2d$dom$40$18$2e$3$2e$1_react$40$18$2e$3$2e$1_$5f$react$40$18$2e$3$2e$1$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__[
											"jsxDEV"
										])(
											"p",
											{
												className: "mt-2 text-sm",
												children:
													"Make sure you have analyzed commits first and the repository is accessible.",
											},
											void 0,
											false,
											{
												fileName:
													"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
												lineNumber: 162,
												columnNumber: 6,
											},
											this,
										),
									],
								},
								void 0,
								true,
								{
									fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
									lineNumber: 160,
									columnNumber: 5,
								},
								this,
							),
					],
				},
				void 0,
				true,
				{
					fileName: "[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx",
					lineNumber: 18,
					columnNumber: 3,
				},
				this,
			)
		}
	},
	"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx [app-rsc] (ecmascript, Next.js Server Component)",
	(__turbopack_context__) => {
		__turbopack_context__.n(
			__turbopack_context__.i(
				"[project]/Roo-Code/apps/web-commit-analysis/src/app/sync/page.tsx [app-rsc] (ecmascript)",
			),
		)
	},
]

//# sourceMappingURL=%5Broot-of-the-server%5D__3325a2ea._.js.map
