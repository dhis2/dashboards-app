import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { ComponentCover } from '@dhis2/ui'
import cx from 'classnames'
import DashboardContainer from './DashboardContainer'
import ViewTitleBar from '../TitleBar/ViewTitleBar'
import ViewItemGrid from '../ItemGrid/ViewItemGrid'
import FilterBar from '../FilterBar/FilterBar'
import DashboardsBar from '../ControlBar/ViewControlBar/DashboardsBar'
import { sGetIsEditing } from '../../reducers/editDashboard'
import { sGetIsPrinting } from '../../reducers/printDashboard'
import { sGetSelectedId } from '../../reducers/selected'
import { sGetPassiveViewRegistered } from '../../reducers/passiveViewRegistered'
import { acClearEditDashboard } from '../../actions/editDashboard'
import { acClearPrintDashboard } from '../../actions/printDashboard'
import { acSetPassiveViewRegistered } from '../../actions/passiveViewRegistered'
import { apiPostDataStatistics } from '../../api/dataStatistics'

import classes from './styles/ViewDashboard.module.css'

export const ViewDashboard = props => {
    const [controlbarExpanded, setControlbarExpanded] = useState(false)

    useEffect(() => {
        if (props.dashboardIsEditing) {
            props.clearEditDashboard()
        } else if (props.dashboardIsPrinting) {
            props.clearPrintDashboard()
        }
    }, [props.dashboardIsEditing, props.dashboardIsPrinting])

    useEffect(() => {
        Array.from(
            document.getElementsByClassName('dashboard-scroll-container')
        ).forEach(container => {
            container.scroll(0, 0)
        })
    }, [props.selectedId])

    useEffect(() => {
        if (!props.passiveViewRegistered) {
            apiPostDataStatistics(
                'PASSIVE_DASHBOARD_VIEW',
                props.selectedId
            ).then(() => {
                props.registerPassiveView()
            })
        }
    }, [props.passiveViewRegistered])

    const onExpandedChanged = expanded => setControlbarExpanded(expanded)

    return (
        <div
            className={cx(classes.container, 'dashboard-scroll-container')}
            data-test="outer-scroll-container"
        >
            <DashboardsBar
                expanded={controlbarExpanded}
                onExpandedChanged={onExpandedChanged}
            />
            <DashboardContainer covered={controlbarExpanded}>
                {controlbarExpanded && (
                    <ComponentCover
                        className={classes.cover}
                        translucent
                        onClick={() => setControlbarExpanded(false)}
                    />
                )}
                <ViewTitleBar />
                <FilterBar />
                <ViewItemGrid />
            </DashboardContainer>
        </div>
    )
}

ViewDashboard.propTypes = {
    clearEditDashboard: PropTypes.func,
    clearPrintDashboard: PropTypes.func,
    dashboardIsEditing: PropTypes.bool,
    dashboardIsPrinting: PropTypes.bool,
    passiveViewRegistered: PropTypes.bool,
    registerPassiveView: PropTypes.func,
    selectedId: PropTypes.string,
}

const mapStateToProps = state => {
    return {
        dashboardIsEditing: sGetIsEditing(state),
        dashboardIsPrinting: sGetIsPrinting(state),
        passiveViewRegistered: sGetPassiveViewRegistered(state),
        selectedId: sGetSelectedId(state),
    }
}

export default connect(mapStateToProps, {
    clearEditDashboard: acClearEditDashboard,
    clearPrintDashboard: acClearPrintDashboard,
    registerPassiveView: acSetPassiveViewRegistered,
})(ViewDashboard)
