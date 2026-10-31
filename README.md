# Annuitätendarlehen-Rechner

Ein statischer, deutschsprachiger Rechner für Annuitätendarlehen. Die Berechnung läuft vollständig im Browser; es werden keine externen Skripte oder Dienste geladen.

## Funktionen

- Monatsrate, Restschuld, Laufzeit und Zinskosten
- Jährliche Sondertilgung und wählbare Aussetzungszeiträume
- Modellierung einer Anschlussfinanzierung nach der Zinsbindung
- Jahres- und Monatsübersicht mit Diagramm sowie Druckansicht
- Responsive Darstellung und beschriftete Bedienelemente

## Lokal ausführen

Die ES-Module benötigen einen lokalen HTTP-Server. Stelle das Repository-Verzeichnis mit einem beliebigen statischen Webserver bereit und öffne dessen URL. Ein Build-Schritt ist nicht erforderlich.

## Prüfen

Voraussetzung ist Node.js 20 oder neuer.

```sh
npm ci
npm run check
```

Die Tests nutzen den integrierten Node.js-Test-Runner; das Projekt hat keine Laufzeit- oder Entwicklungsabhängigkeiten.

## Veröffentlichen

Für die erste Veröffentlichung unter **Settings > Pages > Build and deployment** als Quelle **GitHub Actions** auswählen. Danach führen Pushes auf `main` die Prüfungen aus und veröffentlichen die statische Website automatisch auf [GitHub Pages](https://exploitedroutine.github.io/WebsiteTest/). Veröffentlicht werden `index.html` und `assets/`; ein Build-Schritt ist nicht erforderlich. Der Workflow kann außerdem über GitHub Actions manuell gestartet werden.

## Berechnungsmodell und Hinweise

Die Berechnung erfolgt monatlich in Cent. Sondertilgungen werden einmal jährlich nach der regulären Monatsrate berücksichtigt; Aussetzungszeiträume beziehen sich auf Kalenderjahre. Bei einer Anschlussfinanzierung wird die neue Rate anhand der verbleibenden Restschuld und der eingegebenen Anschlusskonditionen angesetzt.

Das Ergebnis ist eine vereinfachte Modellrechnung und keine Finanz- oder Anlageberatung. Gebühren, abweichende Zahlungszeitpunkte, vertragliche Rundungsverfahren und weitere individuelle Kreditbedingungen können zu anderen Ergebnissen führen. Prüfe verbindliche Angaben mit dem Kreditgeber.

## Projektstruktur

```text
assets/
  css/styles.css
  js/app.js
  js/loan-calculator.js
tests/
  loan-calculator.test.js
.github/workflows/quality.yml
index.html
package.json
```
