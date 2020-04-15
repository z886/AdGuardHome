import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import nanoid from 'nanoid';

import { captitalizeWords } from '../../../helpers/helpers';
import Tooltip from './index';

const Trackers = ({
    id, name, url, category, sourceData,
}) => {
    const renderMap = {
        name_table_header: <a href={url} className="tooltip__link" target="_blank"
                              rel="noopener noreferrer">
            <div className="text-truncate">{name}</div>
        </a>,
        category_label: captitalizeWords(category),
        source_label: <a href={sourceData.url} className="tooltip__link" target="_blank"
                         rel="noopener noreferrer">
            {sourceData.name}
        </a>,
    };

    const getRowCell = arr => arr.map(el =>
        <div key={nanoid()} className="justify-content-between w-100">
            <div className="w-100 text-truncate">
                <Trans>{el}</Trans>
            </div>
        </div>);

    const wrapColumn = cellRow =>
        <div key={nanoid()} className="d-flex justify-content-around flex-column w-50">{cellRow}</div>;


    const renderFunc = (map) => {
        const keys = Object.keys(map);
        const values = Object.values(map);
        return [keys, values].map(items => wrapColumn(getRowCell(items)));
    };

    return <Tooltip id={id}>
        <div className="pb-4 h-25"><Trans>known_tracker</Trans></div>
        <div className="d-flex h-75">
            {renderFunc(renderMap)}
        </div>
    </Tooltip>;
};

Trackers.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    category: PropTypes.string,
    sourceData: PropTypes.object,
};

export default Trackers;
