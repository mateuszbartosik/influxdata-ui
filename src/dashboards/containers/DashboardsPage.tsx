import React, {PureComponent} from 'react'
import {withRouter, InjectedRouter} from 'react-router'
import {connect} from 'react-redux'
import download from 'src/external/download'

import DashboardsHeader from 'src/dashboards/components/DashboardsHeader'
import DashboardsContents from 'src/dashboards/components/DashboardsPageContents'

import {createDashboard} from 'src/dashboards/apis'
import {
  getDashboardsAsync,
  deleteDashboardAsync,
  getChronografVersion,
  importDashboardAsync,
} from 'src/dashboards/actions'

import {NEW_DASHBOARD} from 'src/dashboards/constants'
import {ErrorHandling} from 'src/shared/decorators/errors'

import {Source, Dashboard} from 'src/types'
import {DashboardFile} from 'src/types/dashboard'

interface Props {
  source: Source
  router: InjectedRouter
  handleGetDashboards: () => void
  handleGetChronografVersion: () => string
  handleDeleteDashboard: (dashboard: Dashboard) => void
  handleImportDashboard: (dashboard: Dashboard) => void
  dashboards: Dashboard[]
}

@ErrorHandling
class DashboardsPage extends PureComponent<Props> {
  public componentDidMount() {
    this.props.handleGetDashboards()
  }

  public render() {
    const {dashboards} = this.props
    const dashboardLink = `/sources/${this.props.source.id}`

    return (
      <div className="page">
        <DashboardsHeader />
        <DashboardsContents
          dashboardLink={dashboardLink}
          dashboards={dashboards}
          onDeleteDashboard={this.handleDeleteDashboard}
          onCreateDashboard={this.handleCreateDashboard}
          onCloneDashboard={this.handleCloneDashboard}
          onExportDashboard={this.handleExportDashboard}
          onImportDashboard={this.handleImportDashboard}
        />
      </div>
    )
  }

  private handleCreateDashboard = async (): Promise<void> => {
    const {
      source: {id},
      router: {push},
    } = this.props
    const {data} = await createDashboard(NEW_DASHBOARD)
    push(`/sources/${id}/dashboards/${data.id}`)
  }

  private handleCloneDashboard = (dashboard: Dashboard) => async (): Promise<
    void
  > => {
    const {
      source: {id},
      router: {push},
    } = this.props
    const {data} = await createDashboard({
      ...dashboard,
      name: `${dashboard.name} (clone)`,
    })
    push(`/sources/${id}/dashboards/${data.id}`)
  }

  private handleDeleteDashboard = (dashboard: Dashboard) => (): void => {
    this.props.handleDeleteDashboard(dashboard)
  }

  private handleExportDashboard = (dashboard: Dashboard) => async (): Promise<
    void
  > => {
    const dashboardForDownload = await this.modifyDashboardForDownload(
      dashboard
    )
    download(
      JSON.stringify(dashboardForDownload),
      `${dashboard.name}.json`,
      'text/plain'
    )
  }

  private modifyDashboardForDownload = async (
    dashboard: Dashboard
  ): Promise<DashboardFile> => {
    const version = await this.props.handleGetChronografVersion()
    return {chronografVersion: version, dashboard}
  }

  private handleImportDashboard = async (
    dashboard: Dashboard
  ): Promise<void> => {
    await this.props.handleImportDashboard({
      ...dashboard,
      name: `${dashboard.name} (imported)`,
    })
  }
}

const mapStateToProps = ({dashboardUI: {dashboards, dashboard}}) => ({
  dashboards,
  dashboard,
})

const mapDispatchToProps = {
  handleGetDashboards: getDashboardsAsync,
  handleDeleteDashboard: deleteDashboardAsync,
  handleGetChronografVersion: getChronografVersion,
  handleImportDashboard: importDashboardAsync,
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DashboardsPage)
)
