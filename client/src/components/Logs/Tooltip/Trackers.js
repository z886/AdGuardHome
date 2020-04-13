import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import { captitalizeWords } from '../../../helpers/helpers';
import Tooltip from './index';

const Trackers = ({
    id, name, url, category, sourceData,
}) => (
    <Tooltip id={id}>
        <div className="tooltip__body">
            <div className="tooltip__row">
                <div className="tooltip__label">
                    <Trans>name_table_header</Trans>
                </div>
                <div className="tooltip__value">
                    <a href={url} className="tooltip__link" target="_blank" rel="noopener noreferrer">
                        <strong>{name}</strong>
                    </a>
                </div>
            </div>
            <div className="tooltip__row">
                <div className="tooltip__label">
                    <Trans>category_label</Trans>
                </div>
                <div className="tooltip__value">
                    {captitalizeWords(category)}
                </div>
            </div>
            {sourceData && (
                <div className="tooltip__row">
                    <div className="tooltip__label">
                        <Trans>source_label</Trans>
                    </div>
                    <div className="tooltip__value">
                        <a href={sourceData.url} className="tooltip__link" target="_blank" rel="noopener noreferrer">
                            {sourceData.name}
                        </a>
                    </div>
                </div>
            )}
        </div>
    </Tooltip>
);

Trackers.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    category: PropTypes.string,
    sourceData: PropTypes.object,
};

export default Trackers;
