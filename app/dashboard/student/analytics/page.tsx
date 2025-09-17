'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'

interface AnalyticsData {
  totalStudents: number
  activeStudents: number
  completedTests: number
  averageScore: number
  monthlyGrowth: number
  topSkills: Array<{
    skill: string
    count: number
    percentage: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    user: string
    timestamp: string
    type: 'test' | 'profile' | 'job' | 'other'
  }>
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    // Simulate API call
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        // Mock data - replace with actual API call
        const mockData: AnalyticsData = {
          totalStudents: 1250,
          activeStudents: 890,
          completedTests: 3420,
          averageScore: 78.5,
          monthlyGrowth: 12.3,
          topSkills: [
            { skill: 'JavaScript', count: 245, percentage: 18.2 },
            { skill: 'Python', count: 198, percentage: 14.7 },
            { skill: 'React', count: 156, percentage: 11.6 },
            { skill: 'Node.js', count: 134, percentage: 9.9 },
            { skill: 'SQL', count: 112, percentage: 8.3 }
          ],
          recentActivity: [
            {
              id: '1',
              action: 'Completed Practice Test',
              user: 'John Doe',
              timestamp: '2 hours ago',
              type: 'test'
            },
            {
              id: '2',
              action: 'Updated Profile',
              user: 'Jane Smith',
              timestamp: '4 hours ago',
              type: 'profile'
            },
            {
              id: '3',
              action: 'Applied for Job',
              user: 'Mike Johnson',
              timestamp: '6 hours ago',
              type: 'job'
            }
          ]
        }
        
        setTimeout(() => {
          setAnalyticsData(mockData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Analytics Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Analytics data will appear here once students start using the platform.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights and reporting for your learning journey
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.activeStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analyticsData.activeStudents / analyticsData.totalStudents) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.completedTests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.averageScore}% average score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all assessments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Top Skills</CardTitle>
          <CardDescription>
            Most popular skills among students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topSkills.map((skill, index) => (
              <div key={skill.skill} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium">{skill.skill}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-16">
                    {skill.count} ({skill.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest student activities and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'test' ? 'bg-green-500' :
                  activity.type === 'profile' ? 'bg-blue-500' :
                  activity.type === 'job' ? 'bg-purple-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {activity.user} • {activity.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
