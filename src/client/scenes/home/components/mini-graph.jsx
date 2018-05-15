import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';

const numberOfDays = 1;
const CURRENCY_QUERY = gql`
  query CurrencyQuery(
    $symbol: String
    $quoteSymbol: String
    $start: Int
    $end: Int
    $resolution: CandleResolution!
  ) {
    currency(currencySymbol: $symbol) {
      markets(filter: { quoteSymbol_eq: $quoteSymbol }, aggregation: VWAP) {
        data {
          marketSymbol
          candles(start: $start, end: $end, resolution: $resolution, sort: OLD_FIRST) {
            data
          }
        }
      }
      btcMarket: markets (filter: { quoteSymbol_eq: "BTC" }, aggregation: VWAP) {
        data {
          marketSymbol
          candles(start: $start, end: $end, resolution: $resolution, sort: OLD_FIRST) {
            data
          }
        }
      }
    }
    btcPrice: currency (currencySymbol: "BTC") {
      markets (filter: { quoteSymbol_eq: $quoteSymbol }, aggregation: VWAP) {
        data {
          marketSymbol
          ticker {
            last
          }
        }
      }
    }
  }
`;

export const MiniGraphComponent = ({ data, width, height }) => {
  if (!data.currency) return <div />;
  let prices;
  if (!data.currency.markets.data.length)
  {
    if (data.currency.btcMarket.data.length) {
      let quotePrice = data.btcPrice.markets.data[0].ticker.last;
      prices = data.currency.btcMarket.data[0].candles.data.map(candle => {
        return candle[1] * quotePrice;
      });
    }
    else return <div />;
  }
  else prices = data.currency.markets.data[0].candles.data.map(x => x[1]);

  let high = Math.max(...prices);
  let low = Math.min(...prices);
  let denominator = high - low;
  let actualPoints = prices.map((price, index) => ({
    x: index / (24 * numberOfDays) * width,
    y: height - (price - low) / denominator * height,
  }));
  let paths = actualPoints.map(price => `L ${price.x} ${price.y}`);
  let startingPosition = `M0 ${actualPoints[0].y}`;
  let path = `${startingPosition} ${paths.join(' ')}`;

  return (
    <svg className="mini-graph" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <path d={path} fill="transparent" stroke="#6D747C" />
    </svg>
  );
};

MiniGraphComponent.propTypes = {
  currencyId: PropTypes.string,
  quote: PropTypes.string,
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
};

const withCurrencyQuery = graphql(CURRENCY_QUERY, {
  options: ({ currencyId, quote }) => ({
    variables: {
      symbol: currencyId,
      quoteSymbol: quote,
      start: moment()
        .subtract(numberOfDays, 'day')
        .utc()
        .unix(),
      end: moment()
        .utc()
        .unix(),
      resolution: '_1h',
    },
  }),
});

export const MiniGraph = withCurrencyQuery(MiniGraphComponent);