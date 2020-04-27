import React, { Component } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { Trans } from 'react-i18next';

import { DEBOUNCE_FILTER_TIMEOUT } from '../../../helpers/constants';
import Form from './Form';

class Filters extends Component {
    getFilters = ({
        search, response_status,
    }) => ({
        search: search || '',
        response_status,
    });

    handleFormChange = debounce((values) => {
        const filter = this.getFilters(values);
        this.props.setLogsFilter(filter);
    }, DEBOUNCE_FILTER_TIMEOUT);

    render() {
        const { filter, refreshLogs } = this.props;

        const getRefreshButton = () => (
            <button
                type="button"
                className="btn btn-icon--green ml-3"
                onClick={refreshLogs}
            >
                <svg className="icons icon--small">
                    <use xlinkHref="#update" />
                </svg>
            </button>
        );

        return (
            <div className="page-header page-header--logs">
                <h1 className="page-title page-title--large">
                    <Trans>query_log</Trans>
                    {getRefreshButton()}
                </h1>
                <Form
                    responseStatusClass="d-none d-sm-block"
                    initialValues={filter}
                    onChange={this.handleFormChange}
                />
            </div>
        );
    }
}

Filters.propTypes = {
    filter: PropTypes.object.isRequired,
    setLogsFilter: PropTypes.func.isRequired,
    refreshLogs: PropTypes.func.isRequired,
    processingGetLogs: PropTypes.bool.isRequired,
};

export default Filters;
