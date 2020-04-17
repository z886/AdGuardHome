import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';
import nanoid from 'nanoid';

import Tooltip from './index';

const formatContent = (content) => {
    if (Array.isArray(content)) {
        return ({
            values: content,
        });
    }
    if (typeof content === 'string') {
        return {
            keys: [content],
        };
    }
    return ({
        keys: Object.keys(content),
        values: Object.values(content),
    });
};

const CustomTooltip = ({
    id, title, content, className, place = 'right', rowClass = '', columnClass = 'h-75',
}) => {
    const render = el =>
        <div key={nanoid()}
             className={`justify-content-between w-100 text-truncate colon ${rowClass}`}>
            <Trans>{el}</Trans>
        </div>;

    const getRowCell = el => (el.map ? el.map(render) : render(el));

    const renderFunc = (content) => {
        const { keys, values } = formatContent(content);
        return [keys, values].filter(Boolean)
            .map(items => getRowCell(items));
    };

    return <Tooltip id={id} className={className} place={place}>
        {title && <div className="pb-4 h-25"><Trans>{title}</Trans></div>}
        <div className={`grid ${columnClass}`}>
            {renderFunc(content)}
        </div>
    </Tooltip>;
};

CustomTooltip.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    place: PropTypes.string,
    className: PropTypes.string,
    rowClass: PropTypes.string,
    columnClass: PropTypes.string,
    content: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
        PropTypes.string,
    ]),
};

export default CustomTooltip;
