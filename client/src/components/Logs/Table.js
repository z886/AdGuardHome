import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import ReactTable from 'react-table';
import classNames from 'classnames';
import endsWith from 'lodash/endsWith';
import escapeRegExp from 'lodash/escapeRegExp';
import { FILTERED_STATUS, TABLE_DEFAULT_PAGE_SIZE } from '../../helpers/constants';
import getDateCell from './Cells/getDateCell';
import getDomainCell from './Cells/getDomainCell';
import getClientCell from './Cells/getClientCell';
import getResponseCell from './Cells/getResponseCell';

const blockingTypes = {
    block: 'block',
    unblock: 'unblock',
};

class Table extends Component {
    toggleBlocking = (type, domain) => {
        const {
            t, setRules, getFilteringStatus, addSuccessToast,
        } = this.props;
        const { userRules } = this.props.filtering;

        const lineEnding = !endsWith(userRules, '\n') ? '\n' : '';
        const baseRule = `||${domain}^$important`;
        const baseUnblocking = `@@${baseRule}`;

        const blockingRule = type === blockingTypes.block ? baseUnblocking : baseRule;
        const unblockingRule = type === blockingTypes.block ? baseRule : baseUnblocking;
        const preparedBlockingRule = new RegExp(`(^|\n)${escapeRegExp(blockingRule)}($|\n)`);
        const preparedUnblockingRule = new RegExp(`(^|\n)${escapeRegExp(unblockingRule)}($|\n)`);

        if (userRules.match(preparedBlockingRule)) {
            setRules(userRules.replace(`${blockingRule}`, ''));
            addSuccessToast(`${t('rule_removed_from_custom_filtering_toast')}: ${blockingRule}`);
        } else if (!userRules.match(preparedUnblockingRule)) {
            setRules(`${userRules}${lineEnding}${unblockingRule}\n`);
            addSuccessToast(`${t('rule_added_to_custom_filtering_toast')}: ${unblockingRule}`);
        }

        getFilteringStatus();
    };
    columns = [
        {
            Header: this.props.t('time_table_header'),
            accessor: 'time',
            Cell: row => getDateCell(row, this.props.isDetailed),
            minWidth: 75,
            headerClassName: 'logs__header',
        },
        {
            Header: this.props.t('request_table_header'),
            accessor: 'domain',
            Cell: row => getDomainCell(
                row,
                this.props.t,
                this.props.isDetailed,
                this.toggleBlocking,
            ),
            minWidth: 200,
            headerClassName: 'logs__header',
        },
        {
            Header: this.props.t('response_table_header'),
            accessor: 'response',
            Cell: row => getResponseCell(
                row,
                this.props.filtering,
                this.props.t,
                this.props.isDetailed,
            ),
            headerClassName: 'logs__header',
        },
        {
            Header: () => {
                const plainSelected = classNames({
                    'icon--selected': !this.props.isDetailed,
                });

                const detailedSelected = classNames({
                    'icon--selected': this.props.isDetailed,
                });

                return <div className="d-flex justify-content-between">
                    {this.props.t('client_table_header')}
                    <span>
                        <svg className={`icons icon--small icon--active mr-2 ${plainSelected}`}
                             onClick={() => this.props.toggleDetailedLogs(false)}>
                            <use xlinkHref='#list' />
                        </svg>
                    <svg className={`icons icon--small icon--active ${detailedSelected}`}
                         onClick={() => this.props.toggleDetailedLogs(true)}>
                        <use xlinkHref='#detailed_list' />
                    </svg>
                    </span>
                </div>;
            },
            accessor: 'client',
            Cell: row => getClientCell(
                row,
                this.props.t,
                this.props.isDetailed,
                this.toggleBlocking,
            ),
            headerClassName: 'logs__header',
        },
    ];


    fetchData = (state) => {
        const { pages } = state;
        const { oldest, page, getLogs } = this.props;
        const isLastPage = pages && (page + 1 === pages);

        if (isLastPage) {
            getLogs(oldest, page);
        }
    };

    changePage = (page) => {
        this.props.setLogsPage(page);
        this.props.setLogsPagination({
            page,
            pageSize: TABLE_DEFAULT_PAGE_SIZE,
        });
    };

    render() {
        const {
            t,
            processingGetLogs,
            processingGetConfig,
            logs,
            pages,
            page,
            defaultPageSize,
        } = this.props;
        const isLoading = processingGetLogs || processingGetConfig;

        return (
            <ReactTable
                manual
                minRows={5}
                page={page}
                pages={pages}
                columns={this.columns}
                filterable={false}
                sortable={false}
                resizable={false}
                data={logs || []}
                loading={isLoading}
                showPageJump={false}
                showPageSizeOptions={false}
                onFetchData={this.fetchData}
                onPageChange={this.changePage}
                className="logs__table"
                defaultPageSize={defaultPageSize || TABLE_DEFAULT_PAGE_SIZE}
                loadingText={t('loading_table_status')}
                rowsText={t('rows_table_footer_text')}
                noDataText={t('no_logs_found')}
                pageText=''
                ofText=''
                showPagination
                getPaginationProps={() => ({ className: 'custom-pagination custom-pagination--padding' })}
                previousText={
                    <svg className="icons icon--small icon-gray w-100 h-100">
                        <use xlinkHref="#arrow-left" />
                    </svg>}
                nextText={
                    <svg className="icons icon--small icon-gray w-100 h-100">
                        <use xlinkHref="#arrow-right" />
                    </svg>}
                renderTotalPagesCount={() => false}
                getTrProps={(_state, rowInfo) => {
                    if (!rowInfo) {
                        return {};
                    }

                    const { reason } = rowInfo.original;

                    switch (reason) {
                        case FILTERED_STATUS.FILTERED_SAFE_SEARCH:
                            return { className: 'yellow' };
                        case FILTERED_STATUS.FILTERED_BLACK_LIST:
                        case FILTERED_STATUS.FILTERED_BLOCKED_SERVICE:
                            return { className: 'red' };
                        case FILTERED_STATUS.NOT_FILTERED_WHITE_LIST:
                            return { className: 'green' };
                        case FILTERED_STATUS.REWRITE:
                        case FILTERED_STATUS.REWRITE_HOSTS:
                            return { className: 'blue' };
                        default:
                            return { className: '' };
                    }
                }}
            />
        );
    }
}

Table.propTypes = {
    logs: PropTypes.array.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    defaultPageSize: PropTypes.number,
    oldest: PropTypes.string.isRequired,
    filtering: PropTypes.object.isRequired,
    processingGetLogs: PropTypes.bool.isRequired,
    processingGetConfig: PropTypes.bool.isRequired,
    isDetailed: PropTypes.bool.isRequired,
    setLogsPage: PropTypes.func.isRequired,
    setLogsPagination: PropTypes.func.isRequired,
    getLogs: PropTypes.func.isRequired,
    toggleDetailedLogs: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    setRules: PropTypes.func.isRequired,
    addSuccessToast: PropTypes.func.isRequired,
    getFilteringStatus: PropTypes.func.isRequired,
};

export default withNamespaces()(Table);
