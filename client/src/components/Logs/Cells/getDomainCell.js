import React, { Fragment } from 'react';
import nanoid from 'nanoid';

import Trackers from '../Tooltip/Trackers';

const getDomainCell = (row) => {
    const { value, original: { tracker } } = row;
    const id = nanoid();

    return (
        <div className="logs__row" title={value}>
            {tracker ? (
                <Fragment>
                    <svg
                        className="icons icon--small icon--privacy icon--active"
                        data-tip
                        data-for={id}
                    >
                        <use xlinkHref="#privacy" />
                    </svg>
                    <Trackers
                        id={id}
                        name={tracker.name}
                        url={tracker.url}
                        category={tracker.category}
                        sourceData={tracker.sourceData}
                    />
                </Fragment>
            ) : (
                <svg className="icons icon--small icon--privacy">
                    <use xlinkHref="#privacy" />
                </svg>
            )}
            <div className="logs__text">
                {value}
            </div>
        </div>
    );
};

export default getDomainCell;
