import { useMemo } from 'react';
import { EXAM_DATE } from '@/data/competition-sprint';

/**
 * 统一的考试倒计时与考试是否已结束判断
 *
 * - 考试日期为 EXAM_DATE（2026-11-14）
 * - isExamOver: 当前日期 > 考试日当天 23:59:59 时为 true
 * - daysLeft: 距离考试剩余天数（已结束则为 0）
 *
 * 所有倒计时/考前清单/阶段色相关组件应通过 isExamOver 决定是否渲染
 * 考试结束后这些模块整块隐藏，平台转为长期数学学习工具
 */
export function useExamCountdown() {
  return useMemo(() => {
    const now = new Date();
    const exam = new Date(EXAM_DATE);
    // 考试日当天 23:59:59 前都算备考期
    const examEndOfDay = new Date(exam.getFullYear(), exam.getMonth(), exam.getDate(), 23, 59, 59, 999);
    const isExamOver = now.getTime() > examEndOfDay.getTime();

    const diffMs = examEndOfDay.getTime() - now.getTime();
    const daysLeft = isExamOver ? 0 : Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return { isExamOver, daysLeft, examDate: EXAM_DATE };
  }, []);
}
