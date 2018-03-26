// look at strategy perf overall
// how would the top strategies perform if bought today?

const stratPerfOverall = require('./strategy-perf-overall');
const stratPerfToday = require('./strategy-perf-today');
const avgArray = require('../utils/avg-array');
const strategiesEnabled = require('../strategies-enabled');

module.exports = async (Robinhood) => {
    const overall = await stratPerfOverall(Robinhood);
    const today = await stratPerfToday(Robinhood);
    console.log(overall, today);

    let results = {};

    const returnDidToday = (strategyName) => {
        return {
            strategyName,
            didToday: (() => {
                const foundInToday = today.find(stratPerf => stratPerf.strategyName === strategyName);
                return foundInToday ? foundInToday.avgTrend : null;
            })()
        };
    };

    const addStrategiesToResults = (breakdown, strategies) => {
        console.log(strategies, 'strats');
        const withDidToday = strategies.map(returnDidToday);
        console.log('with did', withDidToday);
        const didTodayArray = withDidToday.map(strat => strat.didToday);
        results[breakdown] = {
            avgTrend: avgArray(didTodayArray.filter(val => !!val)),
            didTodayArray
        };
    };

    Object.keys(overall).forEach(breakdown => {
        const top10 = overall[breakdown]
            .slice(0, 10)
            .map(stratPerf => stratPerf.name);
        addStrategiesToResults(breakdown, top10);
    });

    addStrategiesToResults('strategies-enabled', strategiesEnabled);

    return results;
};