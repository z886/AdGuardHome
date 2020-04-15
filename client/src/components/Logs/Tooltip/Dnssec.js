import React from 'react';
import PropTypes from 'prop-types';
import { Trans } from 'react-i18next';

import Tooltip from './index';

const Dnssec = ({ id }) => (
    <Tooltip id={id} className="custom-tooltip--small">
        <div className="tooltip__body">
            <div className="tooltip__row">
                <div className="tooltip__label">
                    <Trans>validated_with_dnssec</Trans>
                </div>
            </div>
        </div>
    </Tooltip>
);

Dnssec.propTypes = {
    id: PropTypes.string.isRequired,
};

export default Dnssec;
