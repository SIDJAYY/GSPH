import Dashboard from './modules/Dashboard/DashboardOverview'
import ScholarshipOverview from './modules/scholarship/ScholarshipOverview'
import ScholarshipApplications from './modules/scholarship/ScholarshipApplications'
import ScholarshipPrograms from './modules/scholarship/ScholarshipPrograms'
import SADOverview from './modules/schoolAid/SADOverview'
import SADApplications from './modules/schoolAid/SADApplications'
import SADDistributionLogs from './modules/schoolAid/SADDistributionLogs'
import FundAllocation from './modules/schoolAid/FundAllocation'
import PaymentProcessing from './modules/schoolAid/PaymentProcessing'
import Analytics from './modules/schoolAid/Analytics'
import StudentRegistryOverview from './modules/studentRegistry/StudentRegistryOverview'
import ActiveStudents from './modules/studentRegistry/ActiveStudents'
import ArchivedStudents from './modules/studentRegistry/ArchivedStudents'
import Scholars from './modules/studentRegistry/Scholars'
import BulkOperations from './modules/studentRegistry/BulkOperations'
import ReportsAnalytics from './modules/studentRegistry/ReportsAnalytics'
import ImportExport from './modules/studentRegistry/ImportExport'
import PSDOverview from './modules/partnerSchool/PSDOverview'
import PSDSchoolManagement from './modules/partnerSchool/PSDSchoolManagement'
import PSDProgramsPartnerships from './modules/partnerSchool/PSDProgramsPartnerships'
import PSDStudentPopulation from './modules/partnerSchool/PSDStudentPopulation'
import PSDVerification from './modules/partnerSchool/PSDVerification'
import PSDAnalytics from './modules/partnerSchool/PSDAnalytics'
import PSDBulkOperations from './modules/partnerSchool/PSDBulkOperations'
import PSDSettings from './modules/partnerSchool/PSDSettings'
import { EMROverview, AcademicPerformanceReport, EnrollmentReport, StudentProgressReport, AnalyticsCharts } from './modules/educationMonitoring'
import SettingsOverview from './modules/settings/SettingsOverview'

type Props = { activeItem: string; onPageChange?: (id: string) => void }

function ContentRenderer({ activeItem, onPageChange }: Props) {
	switch (activeItem) {
		case 'dashboard':
			return <div><Dashboard /></div>
		case 'Settings':
			return <div>Settings Content</div>
		case 'scholarship-overview':
			return <div><ScholarshipOverview /></div>
		case 'scholarship-applications':
			return <div><ScholarshipApplications /></div>
		case 'scholarship-programs':
			return <div><ScholarshipPrograms /></div>
		case 'sad-overview':
			return <div><SADOverview onPageChange={onPageChange} /></div>
		case 'sad-applications':
			return <div><SADApplications onPageChange={onPageChange} /></div>
		case 'sad-distribution-logs':
			return <div><SADDistributionLogs onPageChange={onPageChange} /></div>
		case 'sad-fund-allocation':
			return <div><FundAllocation onPageChange={onPageChange} /></div>
		case 'sad-payment-processing':
			return <div><PaymentProcessing onPageChange={onPageChange} /></div>
		case 'sad-analytics':
			return <div><Analytics onPageChange={onPageChange} /></div>
		case 'studentRegistry-overview':
			return <div><StudentRegistryOverview /></div>
		case 'studentRegistry-active-students':
			return <div><ActiveStudents /></div>
		case 'studentRegistry-archived-students':
			return <div><ArchivedStudents /></div>
		case 'studentRegistry-scholars':
			return <div><Scholars /></div>
		case 'studentRegistry-bulk-operations':
			return <div><BulkOperations /></div>
		case 'studentRegistry-reports':
			return <div><ReportsAnalytics /></div>
		case 'studentRegistry-import-export':
			return <div><ImportExport /></div>
		case 'psd-overview':
			return <div><PSDOverview /></div>
		case 'psd-school-management':
			return <div><PSDSchoolManagement /></div>
		case 'psd-programs-partnerships':
			return <div><PSDProgramsPartnerships /></div>
		case 'psd-student-population':
			return <div><PSDStudentPopulation /></div>
		case 'psd-verification':
			return <div><PSDVerification /></div>
		case 'psd-analytics':
			return <div><PSDAnalytics /></div>
		case 'psd-bulk-operations':
			return <div><PSDBulkOperations /></div>
		case 'psd-settings':
			return <div><PSDSettings /></div>
		case 'emr-overview':
			return <div><EMROverview /></div>
		case 'emr-academic-performance':
			return <div><AcademicPerformanceReport /></div>
		case 'emr-enrollment-statistics':
			return <div><EnrollmentReport /></div>
		case 'emr-student-progress':
			return <div><StudentProgressReport /></div>
		case 'emr-analytics':
			return <div><AnalyticsCharts /></div>
		case 'settings':
			return <div><SettingsOverview /></div>
		default:
			return <div>Dashboard</div>
	}
}

export default ContentRenderer 