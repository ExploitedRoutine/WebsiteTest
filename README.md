# Annuitätendarlehen-Rechner

Der Rechner ist aktuell als statische, deutschsprachige Webanwendung umgesetzt. Die Berechnung läuft vollständig im Browser, ohne zusätzliche Laufzeitabhängigkeiten oder Build-Schritte. Das Repository enthält eine automatisierte Qualitätsprüfung sowie einen GitHub Pages-Deploy für die publizierte Website.

## Aktueller Status

- Produktionsrelevante Logik in JavaScript, vollständig im Frontend berechnet
- Keine Runtime- oder Entwicklungsabhängigkeiten außerhalb von Node.js für Tests und Syntax-Checks
- Automatisierte Prüfungen mit dem integrierten Node.js-Test-Runner
- GitHub Actions für Qualitätsprüfung und GitHub Pages-Veröffentlichung
- Statische Bereitstellung von `index.html` und `assets/`; kein Bundling erforderlich

## Funktionen

- Monatsrate, Restschuld, Laufzeit und Zinskosten
- Jährliche Sondertilgung und optionale Aussetzungszeiträume
- Modellierung einer Anschlussfinanzierung nach der Zinsbindung
- Jahres- und Monatsübersicht mit Diagramm sowie Druckansicht
- Responsive Darstellung und gut beschriftete Bedienelemente
- Validierung kritischer Eingaben mit aussagekräftigen Fehlermeldungen

## Schnellstart

Voraussetzung ist Node.js 20 oder neuer.

```sh
npm ci
npm run check
```

`npm run check` führt die JavaScript-Syntaxprüfung für die Browser-Dateien und die Test-Suite aus. Die aktuelle Test-Suite deckt unter anderem Standardamortisation, Nullzinsszenarien, Sondertilgungen, Anschlussfinanzierung und Formatierung der Laufzeit ab.

## Lokal ausführen

Die ES-Module müssen über einen lokalen HTTP-Server ausgeliefert werden. Dafür kann ein beliebiger statischer Webserver genutzt werden, z. B.:

```sh
python -m http.server 8000
```

Danach die URL `http://localhost:8000` im Browser öffnen. Ein Build-Schritt ist nicht erforderlich.

## Veröffentlichen und Deployment

Für die Veröffentlichung auf GitHub Pages ist der Workflow in `.github/workflows/pages.yml` konfiguriert. Der Deploy läuft automatisch auf `main` und kann zusätzlich manuell über GitHub Actions gestartet werden.

Vorgehensweise in GitHub:

1. In den Repository-Einstellungen unter "Pages" die Quelle auf "GitHub Actions" setzen.
2. Pushes auf `main` triggern die Qualitätsprüfung und anschließend den Deploy.
3. Die publizierte Seite wird über die GitHub Pages-URL bereitgestellt.

## Berechnungsmodell und Hinweise

Die Berechnung erfolgt monatlich auf Cent-Basis. Sondertilgungen werden einmal jährlich nach der regulären Monatsrate berücksichtigt; Aussetzungszeiträume beziehen sich auf Kalenderjahre. Bei einer Anschlussfinanzierung wird die neue Rate anhand der verbleibenden Restschuld und der eingegebenen Anschlusskonditionen angesetzt.

Das Ergebnis ist eine vereinfachte Modellrechnung und keine Finanz- oder Anlageberatung. Gebühren, abweichende Zahlungszeitpunkte, vertragliche Rundungsverfahren und weitere individuelle Kreditbedingungen können zu anderen Ergebnissen führen. Prüfe verbindliche Angaben mit dem Kreditgeber.

## Projektstruktur

```text
.github/
  workflows/
    quality.yml
    pages.yml
assets/
  css/styles.css
  js/app.js
  js/loan-calculator.js
index.html
tests/
  loan-calculator.test.js
.gitignore
package.json
README.md
```

## Qualitätsstatus

Das Repository ist im aktuellen Zustand für die statische Bereitstellung und die automatische Prüfung vorbereitet. Die relevanten Workflows und die Test-Suite werden im Repository mitgeliefert und sind auf dem aktuellen Stand der Implementierung abgestimmt.
