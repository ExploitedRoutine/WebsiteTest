export function calculateLoan({
  principal,
  annualInterestRate,
  initialRepaymentRate,
  annualExtraRepaymentRate,
  pauseExtraRepayment,
  pauseFromYear,
  pauseToYear,
  refinancingEnabled,
  fixedRateMonths,
  followUpInterestRate,
  followUpRepaymentRate,
  followUpExtraRepaymentRate,
  pauseFollowUpExtraRepayment,
  followUpPauseFromYear,
  followUpPauseToYear,
  startDate,
}) {
  let monthlyRate = annualInterestRate / 12;
  const initialScheduledPayment = Math.round(
    principal * (annualInterestRate + initialRepaymentRate) / 12,
  );
  let scheduledPayment = initialScheduledPayment;
  const annualExtraRepayment = Math.round(principal * annualExtraRepaymentRate);
  const followUpAnnualExtraRepayment =
    Math.round(principal * followUpExtraRepaymentRate);
  let balance = principal;
  let totalInterest = 0;
  let refinancingBalance = null;
  const months = [];
  const maxMonths = 12000;

  for (let month = 1; balance > 0 && month <= maxMonths; month += 1) {
    if (refinancingEnabled && month === fixedRateMonths + 1) {
      monthlyRate = followUpInterestRate / 12;
      scheduledPayment = Math.round(
        balance * (followUpInterestRate + followUpRepaymentRate) / 12,
      );
    }
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + month);
    const interest = Math.round(balance * monthlyRate);
    const payment = Math.min(scheduledPayment, balance + interest);
    const principalPaid = payment - interest;

    if (principalPaid <= 0) {
      throw new Error("Die Rate muss höher als die monatlichen Zinsen sein.");
    }

    balance = Math.max(0, balance - principalPaid);
    const isPaused = pauseExtraRepayment
      && paymentDate.getFullYear() >= pauseFromYear
      && paymentDate.getFullYear() <= pauseToYear;
    const extraRepayment = month % 12 === 0 && !isPaused
      ? Math.min(annualExtraRepayment, balance)
      : 0;
    balance -= extraRepayment;
    const isFollowUpPaused = pauseFollowUpExtraRepayment
      && paymentDate.getFullYear() >= followUpPauseFromYear
      && paymentDate.getFullYear() <= followUpPauseToYear;
    const followUpExtraRepayment = refinancingEnabled
      && month > fixedRateMonths
      && month % 12 === 0
      && !isFollowUpPaused
      ? Math.min(followUpAnnualExtraRepayment, balance)
      : 0;
    balance -= followUpExtraRepayment;
    totalInterest += interest;
    if (refinancingEnabled && month === fixedRateMonths) {
      refinancingBalance = balance;
    }
    months.push({
      month,
      payment,
      principalPaid,
      extraRepayment: extraRepayment + followUpExtraRepayment,
      interest,
      balance,
      paymentDate,
    });
  }

  if (balance > 0) {
    throw new Error("Das Darlehen kann innerhalb des unterstützten Zeitraums nicht vollständig getilgt werden.");
  }

  return {
    initialScheduledPayment,
    annualExtraRepayment,
    followUpAnnualExtraRepayment,
    totalInterest,
    refinancingBalance,
    months,
  };
}

export function formatDuration(monthCount) {
  const years = Math.floor(monthCount / 12);
  const months = monthCount % 12;
  if (years === 0) return `${months} ${months === 1 ? "Monat" : "Monate"}`;
  if (months === 0) return `${years} ${years === 1 ? "Jahr" : "Jahre"}`;
  return `${years} J. ${months} Mon.`;
}

