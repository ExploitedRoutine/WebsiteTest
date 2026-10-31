import { calculateLoan, formatDuration } from "./loan-calculator.js";

const controls = [
  { name: "principal", min: 10000, max: 2000000, step: 1000 },
  { name: "interest", min: 0, max: 15, step: 0.05 },
  { name: "repayment", min: 0.5, max: 15, step: 0.1 },
  { name: "extra-repayment", min: 0, max: 10, step: 0.1 },
];
const euro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const exactEuro = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const percentage = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
const chartNumber = new Intl.NumberFormat("de-DE", {
  notation: "compact",
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat("de-DE", {
  month: "long",
  year: "numeric",
});

function connectControl(control) {
  const range = document.getElementById(`${control.name}-range`);
  const number = document.getElementById(`${control.name}-number`);

  range.addEventListener("input", () => {
    number.value = range.value;
    updateCalculator();
  });

  number.addEventListener("input", () => {
    if (number.value === "") return;
    const value = Number(number.value);
    if (!Number.isFinite(value)) return;
    const bounded = Math.min(control.max, Math.max(control.min, value));
    range.value = String(bounded);
    updateCalculator();
  });

  number.addEventListener("change", () => {
    const value = Number(number.value);
    const bounded = Number.isFinite(value)
      ? Math.min(control.max, Math.max(control.min, value))
      : control.min;
    number.value = String(bounded);
    range.value = String(bounded);
    updateCalculator();
  });
}

function readInputs() {
  const pauseExtraRepayment = document.getElementById("pause-extra-repayment").checked;
  const pauseFromYear = Number(document.getElementById("pause-from-year").value);
  const pauseToYear = Number(document.getElementById("pause-to-year").value);
  const refinancingEnabled = document.getElementById("refinancing-enabled").checked;
  const fixedRateYears = Number(document.getElementById("fixed-rate-years").value);
  const followUpInterestRate = Number(document.getElementById("follow-up-interest").value) / 100;
  const followUpRepaymentRate = Number(document.getElementById("follow-up-repayment").value) / 100;
  const followUpExtraRepaymentRate =
    Number(document.getElementById("follow-up-extra-repayment").value) / 100;
  const pauseFollowUpExtraRepayment =
    document.getElementById("pause-follow-up-extra-repayment").checked;
  const followUpPauseFromYear = Number(
    document.getElementById("follow-up-pause-from-year").value,
  );
  const followUpPauseToYear = Number(
    document.getElementById("follow-up-pause-to-year").value,
  );
  if (
    pauseExtraRepayment
    && (!Number.isInteger(pauseFromYear) || !Number.isInteger(pauseToYear)
      || pauseFromYear > pauseToYear)
  ) {
    throw new Error("Bitte geben Sie einen gültigen, aufsteigenden Kalenderzeitraum ein.");
  }
  if (
    refinancingEnabled
    && (!Number.isInteger(fixedRateYears) || fixedRateYears < 1 || fixedRateYears > 40
      || !Number.isFinite(followUpInterestRate) || followUpInterestRate < 0
      || followUpInterestRate > 0.15
      || !Number.isFinite(followUpRepaymentRate) || followUpRepaymentRate < 0.005
      || followUpRepaymentRate > 0.15
      || !Number.isFinite(followUpExtraRepaymentRate)
      || followUpExtraRepaymentRate < 0
      || followUpExtraRepaymentRate > 0.1)
  ) {
    throw new Error(
      "Bitte prüfen Sie Zinsbindung, Anschlusszins, Tilgung und Sondertilgung danach.",
    );
  }
  if (
    refinancingEnabled
    && pauseFollowUpExtraRepayment
    && (!Number.isInteger(followUpPauseFromYear)
      || !Number.isInteger(followUpPauseToYear)
      || followUpPauseFromYear > followUpPauseToYear)
  ) {
    throw new Error("Bitte geben Sie einen gültigen Zeitraum für die Aussetzung danach ein.");
  }

  return {
    principal: Math.round(Number(document.getElementById("principal-number").value) * 100),
    annualInterestRate: Number(document.getElementById("interest-number").value) / 100,
    initialRepaymentRate: Number(document.getElementById("repayment-number").value) / 100,
    annualExtraRepaymentRate: Number(document.getElementById("extra-repayment-number").value) / 100,
    pauseExtraRepayment,
    pauseFromYear,
    pauseToYear,
    refinancingEnabled,
    fixedRateMonths: fixedRateYears * 12,
    followUpInterestRate,
    followUpRepaymentRate,
    followUpExtraRepaymentRate,
    pauseFollowUpExtraRepayment,
    followUpPauseFromYear,
    followUpPauseToYear,
  };
}

function renderPrintParameters(inputs, result) {
  const parameters = [
    ["Darlehensbetrag", exactEuro.format(inputs.principal / 100)],
    ["Sollzinssatz pro Jahr", `${percentage.format(inputs.annualInterestRate * 100)} %`],
  ];
  if (inputs.refinancingEnabled) {
    parameters.push(["Zinsbindung", `${inputs.fixedRateMonths / 12} Jahre`]);
  }
  parameters.push(
    ["Anfängliche Tilgung", `${percentage.format(inputs.initialRepaymentRate * 100)} %`],
    [
      "Jährliche Sondertilgung",
      `${percentage.format(inputs.annualExtraRepaymentRate * 100)} % (${exactEuro.format(result.annualExtraRepayment / 100)})`,
    ],
    [
      "Sondertilgung aussetzen",
      inputs.pauseExtraRepayment
        ? `Ja, ${inputs.pauseFromYear} bis ${inputs.pauseToYear}`
        : "Nein",
    ],
  );
  parameters.push(
    [
      "Anschlussfinanzierung",
      inputs.refinancingEnabled ? "Berücksichtigt" : "Nicht berücksichtigt",
    ],
  );
  if (inputs.refinancingEnabled) {
    parameters.push(
      [
        "Voraussichtliche Restschuld zur Anschlussfinanzierung",
        exactEuro.format(
          (result.months.length < inputs.fixedRateMonths ? 0 : result.refinancingBalance) / 100,
        ),
      ],
      ["Anschlusszins pro Jahr", `${percentage.format(inputs.followUpInterestRate * 100)} %`],
      ["Anfängliche Tilgung danach", `${percentage.format(inputs.followUpRepaymentRate * 100)} %`],
      [
        "Jährliche Sondertilgung danach",
        `${percentage.format(inputs.followUpExtraRepaymentRate * 100)} % (${exactEuro.format(result.followUpAnnualExtraRepayment / 100)})`,
      ],
      [
        "Sondertilgung danach aussetzen",
        inputs.pauseFollowUpExtraRepayment
          ? `Ja, ${inputs.followUpPauseFromYear} bis ${inputs.followUpPauseToYear}`
          : "Nein",
      ],
    );
  }
  parameters.push(["Gesamtlaufzeit", formatDuration(result.months.length)]);

  const rows = parameters.map(([name, value]) => {
    const row = document.createElement("tr");
    if (name === "Gesamtlaufzeit") row.className = "print-duration-row";
    const heading = document.createElement("th");
    heading.scope = "row";
    heading.textContent = name;
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(heading, cell);
    return row;
  });
  document.getElementById("print-parameters-body").replaceChildren(...rows);
}

function makeYearlyRows(months) {
  const years = new Map();
  for (const month of months) {
    const calendarYear = month.paymentDate.getFullYear();
    if (!years.has(calendarYear)) {
      years.set(calendarYear, {
        paid: 0,
        principal: 0,
        extraRepayment: 0,
        interest: 0,
        balance: 0,
        months: [],
      });
    }
    const year = years.get(calendarYear);
    year.paid += month.payment;
    year.principal += month.principalPaid;
    year.paid += month.extraRepayment;
    year.extraRepayment += month.extraRepayment;
    year.interest += month.interest;
    year.balance = month.balance;
    year.months.push(month);
  }
  return [...years.entries()].map(([calendarYear, year]) => ({
    calendarYear,
    ...year,
  }));
}

function renderSchedule(years) {
  const body = document.getElementById("schedule-body");
  const rows = [];

  for (const year of years) {
    const yearRow = document.createElement("tr");
    yearRow.className = "schedule-year-row";

    const yearCell = document.createElement("td");
    yearCell.className = "year-cell";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "year-toggle";
    toggle.textContent = `Jahr ${year.calendarYear}`;
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", `Monatsraten für ${year.calendarYear} anzeigen`);
    yearCell.append(toggle);
    yearRow.append(yearCell);

    const yearValues = [
      year.paid,
      year.principal,
      year.extraRepayment,
      year.interest,
      year.balance,
    ];
    for (const value of yearValues) {
      const cell = document.createElement("td");
      cell.textContent = exactEuro.format(value / 100);
      yearRow.append(cell);
    }
    rows.push(yearRow);

    const monthRows = year.months.map((month) => {
      const row = document.createElement("tr");
      row.className = "schedule-month-row";
      row.hidden = true;
      const values = [
        monthFormatter.format(month.paymentDate),
        month.payment,
        month.principalPaid,
        month.extraRepayment,
        month.interest,
        month.balance,
      ];
      for (const [cellIndex, value] of values.entries()) {
        const cell = document.createElement("td");
        cell.textContent = cellIndex === 0
          ? value
          : exactEuro.format(value / 100);
        row.append(cell);
      }
      return row;
    });
    rows.push(...monthRows);

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      toggle.setAttribute(
        "aria-label",
        `Monatsraten für ${year.calendarYear} ${expanded ? "anzeigen" : "ausblenden"}`,
      );
      for (const row of monthRows) row.hidden = expanded;
    });
  }

  body.replaceChildren(...rows);
}

function connectPausePeriod({ checkboxId, fromYearId, toYearId, parentCheckboxId }) {
  const checkbox = document.getElementById(checkboxId);
  const fromYear = document.getElementById(fromYearId);
  const toYear = document.getElementById(toYearId);
  const parentCheckbox = parentCheckboxId
    ? document.getElementById(parentCheckboxId)
    : null;
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear + 100;
  const updateDisabledState = () => {
    const enabled = !parentCheckbox || parentCheckbox.checked;
    checkbox.disabled = !enabled;
    fromYear.disabled = !enabled || !checkbox.checked;
    toYear.disabled = !enabled || !checkbox.checked;
  };

  for (const input of [fromYear, toYear]) {
    input.min = String(currentYear);
    input.max = String(lastYear);
    input.value = String(currentYear);
    input.addEventListener("input", updateCalculator);
    input.addEventListener("change", () => {
      const value = Number(input.value);
      const bounded = Number.isFinite(value)
        ? Math.min(lastYear, Math.max(currentYear, Math.round(value)))
        : currentYear;
      input.value = String(bounded);
      if (input === fromYear && Number(fromYear.value) > Number(toYear.value)) {
        toYear.value = String(bounded);
      } else if (input === toYear && Number(toYear.value) < Number(fromYear.value)) {
        fromYear.value = String(bounded);
      }
      updateCalculator();
    });
  }

  checkbox.addEventListener("change", () => {
    updateDisabledState();
    updateCalculator();
  });
  if (parentCheckbox) {
    parentCheckbox.addEventListener("change", () => {
      updateDisabledState();
      updateCalculator();
    });
  }
  updateDisabledState();
}

function connectRefinancing() {
  const checkbox = document.getElementById("refinancing-enabled");
  const fields = [
    { id: "fixed-rate-years", min: 1, max: 40, step: 1 },
    { id: "follow-up-interest", min: 0, max: 15, step: 0.05 },
    { id: "follow-up-repayment", min: 0.5, max: 15, step: 0.1 },
    { id: "follow-up-extra-repayment", min: 0, max: 10, step: 0.1 },
  ];

  for (const field of fields) {
    const input = document.getElementById(field.id);
    const range = document.getElementById(`${field.id}-range`);
    range.addEventListener("input", () => {
      input.value = range.value;
      updateCalculator();
    });
    input.addEventListener("input", updateCalculator);
    input.addEventListener("change", () => {
      const value = Number(input.value);
      const bounded = Number.isFinite(value)
        ? Math.min(field.max, Math.max(field.min, value))
        : field.min;
      input.value = String(bounded);
      range.value = String(bounded);
      updateCalculator();
    });
  }

  checkbox.addEventListener("change", () => {
    for (const field of fields) {
      document.getElementById(field.id).disabled = !checkbox.checked;
      document.getElementById(`${field.id}-range`).disabled = !checkbox.checked;
    }
    document.getElementById("pause-follow-up-extra-repayment").disabled =
      !checkbox.checked;
    updateCalculator();
  });
}

function renderChart(months, principal) {
  const width = 680;
  const height = 220;
  const left = 58;
  const right = 12;
  const top = 10;
  const bottom = 34;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maxBalance = principal / 100;
  const points = [{ month: 0, balance: maxBalance }];

  for (let index = 11; index < months.length; index += 12) {
    points.push({ month: index + 1, balance: months[index].balance / 100 });
  }
  if (points[points.length - 1].month !== months.length) {
    points.push({
      month: months.length,
      balance: months[months.length - 1].balance / 100,
    });
  }

  const x = (month) => left + (month / months.length) * plotWidth;
  const y = (balance) => top + (1 - balance / maxBalance) * plotHeight;
  const linePoints = points.map((point) => `${x(point.month)},${y(point.balance)}`);
  const linePath = `M ${linePoints.join(" L ")}`;
  const areaPath = `${linePath} L ${x(months.length)},${top + plotHeight} L ${left},${top + plotHeight} Z`;
  document.getElementById("chart-line").setAttribute("d", linePath);
  document.getElementById("chart-area").setAttribute("d", areaPath);

  const grid = document.getElementById("chart-grid");
  const labels = document.getElementById("chart-labels");
  const yearCount = Math.ceil(months.length / 12);
  const tickCount = 4;
  const gridNodes = [];
  const labelNodes = [];

  for (let tick = 0; tick <= tickCount; tick += 1) {
    const value = maxBalance * (1 - tick / tickCount);
    const yPosition = top + (tick / tickCount) * plotHeight;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(left));
    line.setAttribute("x2", String(width - right));
    line.setAttribute("y1", String(yPosition));
    line.setAttribute("y2", String(yPosition));
    line.setAttribute("class", "grid-line");
    gridNodes.push(line);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", "0");
    label.setAttribute("y", String(yPosition + 4));
    label.setAttribute("class", "axis-label");
    label.textContent = chartNumber.format(value);
    labelNodes.push(label);
  }

  const startLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  startLabel.setAttribute("x", String(left));
  startLabel.setAttribute("y", String(height - 5));
  startLabel.setAttribute("class", "axis-label");
  startLabel.textContent = "Heute";
  labelNodes.push(startLabel);

  const endLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  endLabel.setAttribute("x", String(width - right));
  endLabel.setAttribute("y", String(height - 5));
  endLabel.setAttribute("text-anchor", "end");
  endLabel.setAttribute("class", "axis-label");
  endLabel.textContent = `${yearCount} ${yearCount === 1 ? "Jahr" : "Jahre"}`;
  labelNodes.push(endLabel);

  grid.replaceChildren(...gridNodes);
  labels.replaceChildren(...labelNodes);
}

function updateCalculator() {
  try {
    const scheduleStart = new Date();
    scheduleStart.setDate(1);
    const inputs = readInputs();
    const result = calculateLoan({ ...inputs, startDate: scheduleStart });
    const totalPaid = inputs.principal + result.totalInterest;
    renderPrintParameters(inputs, result);
    const paymentCaption = document.getElementById("payment-caption");
    const followUpPaymentPanel = document.getElementById("follow-up-payment-panel");
    const paymentPanel = document.querySelector(".payment-panel");
    const refinancingSummary = document.getElementById("refinancing-summary");
    document.getElementById("extra-repayment-caption").textContent =
      `${Number(document.getElementById("extra-repayment-number").value)} % der ursprünglichen Darlehenssumme = ${euro.format(result.annualExtraRepayment / 100)} pro Jahr`;
    document.getElementById("monthly-payment").textContent =
      euro.format(result.initialScheduledPayment / 100);
    if (inputs.refinancingEnabled) {
      const refinancingBalance = result.months.length < inputs.fixedRateMonths
        ? 0
        : result.refinancingBalance;
      refinancingSummary.hidden = false;
      document.getElementById("refinancing-balance").textContent =
        euro.format(refinancingBalance / 100);
      const followUpPayment = result.months[inputs.fixedRateMonths]?.payment;
      if (followUpPayment === undefined) {
        followUpPaymentPanel.hidden = true;
        paymentPanel.classList.remove("has-follow-up");
        paymentCaption.textContent =
          `Vollständig getilgt vor Ende der ${inputs.fixedRateMonths / 12}-jährigen Zinsbindung`;
      } else {
        followUpPaymentPanel.hidden = false;
        paymentPanel.classList.add("has-follow-up");
        document.getElementById("follow-up-payment").textContent =
          euro.format(followUpPayment / 100);
        paymentCaption.textContent = `Bis zum Ende der ${inputs.fixedRateMonths / 12}-jährigen Zinsbindung`;
      }
    } else {
      followUpPaymentPanel.hidden = true;
      paymentPanel.classList.remove("has-follow-up");
      refinancingSummary.hidden = true;
      paymentCaption.textContent = "";
    }
    document.getElementById("payoff-time").textContent =
      formatDuration(result.months.length);
    document.getElementById("total-interest").textContent =
      euro.format(result.totalInterest / 100);
    document.getElementById("total-paid").textContent =
      euro.format(totalPaid / 100);
    renderChart(result.months, inputs.principal);
    renderSchedule(makeYearlyRows(result.months));
  } catch (error) {
    document.getElementById("payment-caption").textContent = error.message;
  }
}

for (const control of controls) connectControl(control);
connectPausePeriod({
  checkboxId: "pause-extra-repayment",
  fromYearId: "pause-from-year",
  toYearId: "pause-to-year",
});
connectPausePeriod({
  checkboxId: "pause-follow-up-extra-repayment",
  fromYearId: "follow-up-pause-from-year",
  toYearId: "follow-up-pause-to-year",
  parentCheckboxId: "refinancing-enabled",
});
connectRefinancing();
document.getElementById("print-button").addEventListener("click", () => window.print());
updateCalculator();