import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';

import { TABLE_DEFAULT_PAGE_SIZE } from '../../helpers/constants';

import Loading from '../ui/Loading';
import Filters from './Filters';
import Table from './Table';
import Disabled from './Disabled';

import './Logs.css';

const TABLE_FIRST_PAGE = 0;
const INITIAL_REQUEST = true;
const INITIAL_REQUEST_DATA = ['', TABLE_FIRST_PAGE, INITIAL_REQUEST];

class Logs extends Component {
    componentDidMount() {
        this.props.setLogsPage(TABLE_FIRST_PAGE);
        this.getLogs(...INITIAL_REQUEST_DATA);
        this.props.getFilteringStatus();
        this.props.getLogsConfig();
    }

    getLogs = (older_than, page, initial) => {
        if (this.props.queryLogs.enabled) {
            this.props.getLogs({
                older_than, page, pageSize: TABLE_DEFAULT_PAGE_SIZE, initial,
            });
        }
    };

    refreshLogs = () => {
        this.getLogs(...INITIAL_REQUEST_DATA);
    };

    render() {
        const {
            filtering,
            setLogsPage,
            setLogsPagination,
            setLogsFilter,
            toggleDetailedLogs,
            queryLogs: {
                filter,
                enabled,
                processingGetConfig,
                processingAdditionalLogs,
                processingGetLogs,
                oldest,
                logs,
                pages,
                page,
                isDetailed,
            },
        } = this.props;

        return (
            <Fragment>
                {enabled && processingGetConfig && <Loading />}
                {enabled && !processingGetConfig && (
                    <Fragment>
                        <Filters
                            filter={filter}
                            processingGetLogs={processingGetLogs}
                            processingAdditionalLogs={processingAdditionalLogs}
                            setLogsFilter={setLogsFilter}
                            refreshLogs={this.refreshLogs}
                        />
                        <Table
                            logs={logs}
                            pages={pages}
                            page={page}
                            oldest={oldest}
                            filtering={filtering}
                            processingGetLogs={processingGetLogs}
                            processingGetConfig={processingGetConfig}
                            isDetailed={isDetailed}
                            setLogsPagination={setLogsPagination}
                            setLogsPage={setLogsPage}
                            toggleDetailedLogs={toggleDetailedLogs}
                            getLogs={this.getLogs}
                            setRules={this.props.setRules}
                            addSuccessToast={this.props.addSuccessToast}
                            getFilteringStatus={this.props.getFilteringStatus}
                        />
                    </Fragment>
                )}
                {!enabled && !processingGetConfig && (
                    <Disabled />
                )}
            </Fragment>
        );
    }
}

Logs.propTypes = {
    getLogs: PropTypes.func.isRequired,
    queryLogs: PropTypes.object.isRequired,
    dashboard: PropTypes.object.isRequired,
    getFilteringStatus: PropTypes.func.isRequired,
    filtering: PropTypes.object.isRequired,
    setRules: PropTypes.func.isRequired,
    addSuccessToast: PropTypes.func.isRequired,
    getClients: PropTypes.func.isRequired,
    getLogsConfig: PropTypes.func.isRequired,
    setLogsPagination: PropTypes.func.isRequired,
    setLogsFilter: PropTypes.func.isRequired,
    setLogsPage: PropTypes.func.isRequired,
    toggleDetailedLogs: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

export default withNamespaces()(Logs);
