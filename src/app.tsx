import { lazy, Suspense, Component, type ErrorInfo } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";
import HomePage from "@/pages/Home/HomePage";
import { ThemeProvider } from "@/hooks/useTheme";
import { logger } from "@/lib/lark-mock";

/** 根级 ErrorBoundary：任何子页面渲染异常都兜住，不白屏 */
class AppErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; errorMsg: string } {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('AppErrorBoundary caught:', `${error.message} ${errorInfo.componentStack ?? ''}`);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 shadow-sm text-center">
            <div className="size-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg className="size-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">页面出错了</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              渲染过程中发生了异常，请刷新页面重试。如果问题持续出现，请联系开发者。
            </p>
            {this.state.errorMsg && (
              <div className="text-xs text-muted-foreground/70 font-mono bg-muted/50 rounded-lg p-3 mb-6 text-left break-all">
                {this.state.errorMsg}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover-elevate active-elevate-2"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                <path d="M3 21v-5h5" />
              </svg>
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 非首屏工具页同样懒加载，避免进入首屏主包；仅首页 HomePage 保留直接 import
const AiLabPageLazy = lazy(() => import("@/pages/AiLab/AiLabPage"));
const AiReviewPageLazy = lazy(() => import("@/pages/AiLab/AiReviewPage"));
const ExplainLabPageLazy = lazy(() => import("@/pages/ExplainLab/ExplainLabPage"));
const GeometryDrillPageLazy = lazy(() => import("@/pages/GeometryDrill/GeometryDrillPage"));
const FormulaHandbookLazy = lazy(() => import("@/pages/FormulaHandbook/FormulaHandbookPage"));
const ScientificCalculatorLazy = lazy(() => import("@/pages/ScientificCalculator/ScientificCalculatorPage"));
const SymbolicAlgebraLazy = lazy(() => import("@/pages/SymbolicAlgebra/SymbolicAlgebraPage"));
const CalculusLazy = lazy(() => import("@/pages/Calculus/CalculusPage"));

// 其他模块懒加载 — 每个模块独立包装 Suspense，避免重复组件 lint 报错
const LinearAlgebraLazy = lazy(() => import("@/pages/LinearAlgebra/LinearAlgebraPage"));
const ProbabilityStatsLazy = lazy(() => import("@/pages/ProbabilityStats/ProbabilityStatsPage"));
const NumberTheoryLazy = lazy(() => import("@/pages/NumberTheory/NumberTheoryPage"));
const Plot2DLazy = lazy(() => import("@/pages/Plot2D/Plot2DPage"));
const Plot3DLazy = lazy(() => import("@/pages/Plot3D/Plot3DPage"));
const DataChartLazy = lazy(() => import("@/pages/DataChart/DataChartPage"));
const MultiVarCalcLazy = lazy(() => import("@/pages/MultiVarCalc/MultiVarCalcPage"));
const ODELazy = lazy(() => import("@/pages/ODE/ODEPage"));
const NumericalAnalysisLazy = lazy(() => import("@/pages/NumericalAnalysis/NumericalAnalysisPage"));
const FourierSeriesLazy = lazy(() => import("@/pages/FourierSeries/FourierSeriesPage"));
const ComplexNumbersLazy = lazy(() => import("@/pages/ComplexNumbers/ComplexNumbersPage"));
const DiscreteMathLazy = lazy(() => import("@/pages/DiscreteMath/DiscreteMathPage"));
const ModernMathLazy = lazy(() => import("@/pages/ModernMath/ModernMathPage"));
const PDELazy = lazy(() => import("@/pages/PDE/PDEPage"));
const DiffGeoLazy = lazy(() => import("@/pages/DiffGeo/DiffGeoPage"));
const CompetitionLazy = lazy(() => import("@/pages/Competition/CompetitionPage"));
const PracticeLazy = lazy(() => import("@/pages/Practice/PracticePage"));
const WrongBookLazy = lazy(() => import("@/pages/WrongBook/WrongBookPage"));
const AboutLazy = lazy(() => import("@/pages/About/AboutPage"));
const PrivacyLazy = lazy(() => import("@/pages/About/PrivacyPage"));
const ProgressLazy = lazy(() => import("@/pages/Progress/ProgressPage"));
const KnowledgeMapLazy = lazy(() => import("@/pages/KnowledgeMap/KnowledgeMapPage"));
const IntegralVisLazy = lazy(() => import("@/pages/IntegralVisualization/IntegralVisualizationPage"));
const ToolsLazy = lazy(() => import("@/pages/Tools/ToolsPage"));
const PhotoSolveLazy = lazy(() => import("@/pages/PhotoSolve/PhotoSolvePage"));
const MathematicianQuizLazy = lazy(() => import("@/pages/MathematicianQuiz/MathematicianQuizPage"));
const BlindBoxLazy = lazy(() => import("@/pages/BlindBox/BlindBoxCollectionPage"));
const SpellbookLazy = lazy(() => import("@/pages/Spellbook/SpellbookPage"));
const TeacherLazy = lazy(() => import("@/pages/Teacher/TeacherPage"));
const AIQuizLazy = lazy(() => import("@/pages/AIQuiz/AIQuizPage"));
const ExplainerLazy = lazy(() => import("@/pages/Explainer/ExplainerPage"));
const BranchesLazy = lazy(() => import("@/pages/Branches/BranchesPage"));
const CourseLazy = lazy(() => import("@/pages/Course/CoursePage"));
const BranchLazy = lazy(() => import("@/pages/Branch/BranchPage"));
const FlowLazy = lazy(() => import("@/pages/Flow/FlowPage"));

function ModuleFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="size-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
      <p className="text-sm">加载模块中...</p>
    </div>
  );
}

function FormulaHandbookPage() {
  return (<Suspense fallback={<ModuleFallback />}><FormulaHandbookLazy /></Suspense>);
}
function ScientificCalculatorPage() {
  return (<Suspense fallback={<ModuleFallback />}><ScientificCalculatorLazy /></Suspense>);
}
function SymbolicAlgebraPage() {
  return (<Suspense fallback={<ModuleFallback />}><SymbolicAlgebraLazy /></Suspense>);
}
function CalculusPage() {
  return (<Suspense fallback={<ModuleFallback />}><CalculusLazy /></Suspense>);
}

function LinearAlgebraPage() {
  return (<Suspense fallback={<ModuleFallback />}><LinearAlgebraLazy /></Suspense>);
}
function ProbabilityStatsPage() {
  return (<Suspense fallback={<ModuleFallback />}><ProbabilityStatsLazy /></Suspense>);
}
function NumberTheoryPage() {
  return (<Suspense fallback={<ModuleFallback />}><NumberTheoryLazy /></Suspense>);
}
function Plot2DPage() {
  return (<Suspense fallback={<ModuleFallback />}><Plot2DLazy /></Suspense>);
}
function Plot3DPage() {
  return (<Suspense fallback={<ModuleFallback />}><Plot3DLazy /></Suspense>);
}
function DataChartPage() {
  return (<Suspense fallback={<ModuleFallback />}><DataChartLazy /></Suspense>);
}
function MultiVarCalcPage() {
  return (<Suspense fallback={<ModuleFallback />}><MultiVarCalcLazy /></Suspense>);
}
function ODEPage() {
  return (<Suspense fallback={<ModuleFallback />}><ODELazy /></Suspense>);
}
function NumericalAnalysisPage() {
  return (<Suspense fallback={<ModuleFallback />}><NumericalAnalysisLazy /></Suspense>);
}
function FourierSeriesPage() {
  return (<Suspense fallback={<ModuleFallback />}><FourierSeriesLazy /></Suspense>);
}
function ComplexNumbersPage() {
  return (<Suspense fallback={<ModuleFallback />}><ComplexNumbersLazy /></Suspense>);
}
function DiscreteMathPage() {
  return (<Suspense fallback={<ModuleFallback />}><DiscreteMathLazy /></Suspense>);
}
function ModernMathPage() {
  return (<Suspense fallback={<ModuleFallback />}><ModernMathLazy /></Suspense>);
}
function PDEPage() {
  return (<Suspense fallback={<ModuleFallback />}><PDELazy /></Suspense>);
}
function DiffGeoPage() {
  return (<Suspense fallback={<ModuleFallback />}><DiffGeoLazy /></Suspense>);
}
function CompetitionPage() {
  return (<Suspense fallback={<ModuleFallback />}><CompetitionLazy /></Suspense>);
}
function PracticePage() {
  return (<Suspense fallback={<ModuleFallback />}><PracticeLazy /></Suspense>);
}
function IntegralVisPage() {
  return (<Suspense fallback={<ModuleFallback />}><IntegralVisLazy /></Suspense>);
}
function ToolsPage() {
  return (<Suspense fallback={<ModuleFallback />}><ToolsLazy /></Suspense>);
}
function PhotoSolvePage() {
  return (<Suspense fallback={<ModuleFallback />}><PhotoSolveLazy /></Suspense>);
}
function MathematicianQuizPage() {
  return (<Suspense fallback={<ModuleFallback />}><MathematicianQuizLazy /></Suspense>);
}
function BlindBoxPage() {
  return (<Suspense fallback={<ModuleFallback />}><BlindBoxLazy /></Suspense>);
}
function SpellbookPage() {
  return (<Suspense fallback={<ModuleFallback />}><SpellbookLazy /></Suspense>);
}
function TeacherPage() {
  return (<Suspense fallback={<ModuleFallback />}><TeacherLazy /></Suspense>);
}

export default function App() {
  return (
    <ThemeProvider>
      <AppErrorBoundary>
        <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="formulas" element={<FormulaHandbookPage />} />
          <Route path="calculator" element={<ScientificCalculatorPage />} />
          <Route path="symbolic" element={<SymbolicAlgebraPage />} />
          <Route path="calculus" element={<CalculusPage />} />
          <Route path="linear-algebra" element={<LinearAlgebraPage />} />
          <Route path="probability" element={<ProbabilityStatsPage />} />
          <Route path="number-theory" element={<NumberTheoryPage />} />
          <Route path="plot-2d" element={<Plot2DPage />} />
          <Route path="plot-3d" element={<Plot3DPage />} />
          <Route path="data-chart" element={<DataChartPage />} />
          <Route path="multivariable" element={<MultiVarCalcPage />} />
          <Route path="ode" element={<ODEPage />} />
          <Route path="numerical" element={<NumericalAnalysisPage />} />
          <Route path="fourier" element={<FourierSeriesPage />} />
          <Route path="complex" element={<ComplexNumbersPage />} />
          <Route path="discrete" element={<DiscreteMathPage />} />
          <Route path="modern" element={<ModernMathPage />} />
          <Route path="pde" element={<PDEPage />} />
          <Route path="diff-geo" element={<DiffGeoPage />} />
          <Route path="competition" element={<CompetitionPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="wrong-book" element={<Suspense fallback={<div className="h-64" />}><WrongBookLazy /></Suspense>} />
          <Route path="progress" element={<Suspense fallback={<div className="h-64" />}><ProgressLazy /></Suspense>} />
          <Route path="about" element={<Suspense fallback={<div className="h-64" />}><AboutLazy /></Suspense>} />
          <Route path="privacy" element={<Suspense fallback={<div className="h-64" />}><PrivacyLazy /></Suspense>} />
          <Route path="ai-lab" element={<AiLabPageLazy />} />
          <Route path="explain-lab" element={<Suspense fallback={<ModuleFallback />}><ExplainLabPageLazy /></Suspense>} />
          <Route path="geometry-drill" element={<Suspense fallback={<ModuleFallback />}><GeometryDrillPageLazy /></Suspense>} />
          <Route path="ai-review" element={<AiReviewPageLazy />} />
          <Route path="integral-visualization" element={<IntegralVisPage />} />
          <Route path="knowledge-map" element={<Suspense fallback={<ModuleFallback />}><KnowledgeMapLazy /></Suspense>} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="photo-solve" element={<PhotoSolvePage />} />
          <Route path="mathematician-quiz" element={<MathematicianQuizPage />} />
          <Route path="blind-box" element={<BlindBoxPage />} />
          <Route path="spellbook" element={<SpellbookPage />} />
          <Route path="teacher" element={<TeacherPage />} />
          <Route path="ai-quiz" element={<Suspense fallback={<ModuleFallback />}><AIQuizLazy /></Suspense>} />
          <Route path="branches" element={<Suspense fallback={<ModuleFallback />}><BranchesLazy /></Suspense>} />
          <Route path="branch/:id" element={<Suspense fallback={<ModuleFallback />}><BranchLazy /></Suspense>} />
          <Route path="course/:subject" element={<Suspense fallback={<ModuleFallback />}><CourseLazy /></Suspense>} />
          <Route path="course/:subject/:chapterId" element={<Suspense fallback={<ModuleFallback />}><CourseLazy /></Suspense>} />
          <Route path="explainer" element={<Suspense fallback={<ModuleFallback />}><ExplainerLazy /></Suspense>} />
          <Route path="flow" element={<Suspense fallback={<ModuleFallback />}><FlowLazy /></Suspense>} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AppErrorBoundary>
    </ThemeProvider>
  );
}
