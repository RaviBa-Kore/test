const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('dice-lib');

function generateRandom10DigitNumber() {
    const min = 1000000000 ; // Smallest 10-digit number
    const max = 9999999999; // Largest 10-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min ;
}

function tokensGeneration() {
    const min = 10;
    const max = 1000;
    const randomInRange = () => Math.floor(Math.random() * (max - min + 1)) + min;
    
    return {
        inTokens: randomInRange(),
        outTokens: randomInRange()
    };
}


function getRandomEvent() {
    const nodeEvents = [
        "cf_step_execution_event",
        "cf_stepcomplete_event",
        "cf_stepexecution_success_event",
        "cf_stepfailure_event",
        "cf_stepstart_event",
    ]
    const randomIndex = Math.floor(Math.random() * nodeEvents.length);
    return nodeEvents[randomIndex];
}

function getRandomStepName() {
    const stepNames = ["API001", "AI001", "ServiceTask001", "ScriptTask001", "Split001"]
    const randomIndex = Math.floor(Math.random() * stepNames.length);
    return stepNames[randomIndex];
}

function getRandomTaskName() {
    const names = [
        "agenttransfer",
        "endflow",
        "llm",
        "messageprompt",
        "script",
        "service",
        "start",
        "uxoautomation"
    ]
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
}

function executeEvent(eventName) {
    return tracer.startActiveSpan(`${eventName}`, (span) => {
        span.end()
    })
}


function executeNode(events, min, max) {

    return tracer.startActiveSpan(`Node`, (span) => {
        const result = Math.floor(Math.random() * (max - min) + min);
        const stepId = 'cfst-' + generateRandom10DigitNumber()
        for (let i = 0; i < events; i++) {
            executeEvent(getRandomEvent())
        }
        span.setAttribute('stepId', stepId);
        span.setAttribute('stepName', getRandomStepName());
        span.setAttribute('taskName', getRandomTaskName());

        span.end();
        return result;
    });
}

function executeFlow(rolls, min, max) {
    // Create a span. A span must be closed.
    return tracer.startActiveSpan('Flow', (parentSpan) => {
        const result = [];
        for (let i = 1; i < rolls; i++) {
            result.push(executeNode(i, min, max));
        }
        parentSpan.setAttribute('accId', generateRandom10DigitNumber())
        parentSpan.setAttribute('appId', 'app-' + generateRandom10DigitNumber())
        parentSpan.setAttribute('flowId', 'cf-' + generateRandom10DigitNumber())
        parentSpan.setAttribute('processId', 'cfp-' + generateRandom10DigitNumber())
        parentSpan.setAttribute('tokens', JSON.stringify(tokensGeneration()))
        parentSpan.addEvent('cf_failure_event',{'timestamp':'2024-01-09T12:18:13.350Z'})

        // Be sure to end the span!
        parentSpan.end();
        return result;
    });
}

module.exports = { executeFlow }
