"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Target, Award, Crown, Medal, Gift, Calendar } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
  unlocked: boolean
  progress: number
  maxProgress: number
  category: string
}

interface Challenge {
  id: string
  title: string
  description: string
  type: "daily" | "weekly" | "special"
  reward: number
  deadline: Date
  completed: boolean
  progress: number
  maxProgress: number
}

interface UserStats {
  level: number
  xp: number
  xpToNext: number
  totalPoints: number
  streak: number
  rank: string
  badges: string[]
}

export function GamificationSystem({ userId }: { userId: string }) {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 5,
    xp: 1250,
    xpToNext: 1500,
    totalPoints: 3420,
    streak: 7,
    rank: "Scholar",
    badges: ["first-lesson", "quick-learner", "streak-master"],
  })

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [selectedTab, setSelectedTab] = useState<"overview" | "achievements" | "challenges">("overview")

  useEffect(() => {
    // Initialize achievements
    const achievementsList: Achievement[] = [
      {
        id: "first-lesson",
        title: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        rarity: "common",
        points: 50,
        unlocked: true,
        progress: 1,
        maxProgress: 1,
        category: "Learning",
      },
      {
        id: "quick-learner",
        title: "Quick Learner",
        description: "Complete 5 lessons in one day",
        icon: "⚡",
        rarity: "rare",
        points: 200,
        unlocked: true,
        progress: 5,
        maxProgress: 5,
        category: "Speed",
      },
      {
        id: "streak-master",
        title: "Streak Master",
        description: "Maintain a 7-day learning streak",
        icon: "🔥",
        rarity: "epic",
        points: 500,
        unlocked: true,
        progress: 7,
        maxProgress: 7,
        category: "Consistency",
      },
      {
        id: "perfect-score",
        title: "Perfectionist",
        description: "Score 100% on 10 quizzes",
        icon: "💯",
        rarity: "legendary",
        points: 1000,
        unlocked: false,
        progress: 3,
        maxProgress: 10,
        category: "Excellence",
      },
      {
        id: "knowledge-seeker",
        title: "Knowledge Seeker",
        description: "Complete 50 lessons",
        icon: "📚",
        rarity: "epic",
        points: 750,
        unlocked: false,
        progress: 12,
        maxProgress: 50,
        category: "Learning",
      },
    ]

    // Initialize challenges
    const challengesList: Challenge[] = [
      {
        id: "daily-lesson",
        title: "Daily Learning",
        description: "Complete at least one lesson today",
        type: "daily",
        reward: 50,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        completed: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: "weekly-streak",
        title: "Weekly Warrior",
        description: "Learn for 5 days this week",
        type: "weekly",
        reward: 200,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 3,
        maxProgress: 5,
      },
      {
        id: "math-master",
        title: "Math Master Challenge",
        description: "Complete all math lessons with 90%+ score",
        type: "special",
        reward: 500,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 1,
        maxProgress: 3,
      },
    ]

    setAchievements(achievementsList)
    setChallenges(challengesList)
  }, [userId])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 bg-gray-100"
      case "rare":
        return "text-blue-600 bg-blue-100"
      case "epic":
        return "text-purple-600 bg-purple-100"
      case "legendary":
        return "text-yellow-600 bg-yellow-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "text-green-600 bg-green-100"
      case "weekly":
        return "text-blue-600 bg-blue-100"
      case "special":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h`
    return "< 1h"
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-primary">Level {userStats.level}</div>
            <p className="text-sm text-muted-foreground">{userStats.rank}</p>
            <Progress value={(userStats.xp / userStats.xpToNext) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {userStats.xp}/{userStats.xpToNext} XP
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</div>
            <p className="text-sm text-muted-foreground">Total Points</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center mb-2">
              <Medal className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{achievements.filter((a) => a.unlocked).length}</div>
            <p className="text-sm text-muted-foreground">Achievements</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2">
        {(["overview", "achievements", "challenges"] as const).map((tab) => (
          <Button
            key={tab}
            variant={selectedTab === tab ? "default" : "outline"}
            onClick={() => setSelectedTab(tab)}
            className="capitalize"
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements
                  .filter((a) => a.unlocked)
                  .slice(0, 3)
                  .map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                      <Badge className={getRarityColor(achievement.rarity)}>{achievement.points} pts</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {challenges
                  .filter((c) => !c.completed)
                  .slice(0, 3)
                  .map((challenge) => (
                    <div key={challenge.id} className="p-3 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{challenge.title}</p>
                          <p className="text-xs text-muted-foreground">{challenge.description}</p>
                        </div>
                        <Badge className={getChallengeTypeColor(challenge.type)}>{challenge.type}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <Progress value={(challenge.progress / challenge.maxProgress) * 100} className="flex-1 mr-3" />
                        <div className="text-xs text-muted-foreground">{formatTimeRemaining(challenge.deadline)}</div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {challenge.progress}/{challenge.maxProgress}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                          <Gift className="h-3 w-3" />
                          {challenge.reward} pts
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === "achievements" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`transition-all ${achievement.unlocked ? "border-primary/20 bg-primary/5" : "opacity-75"}`}
            >
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">{achievement.icon}</div>
                <h3 className="font-semibold mb-1">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Badge className={getRarityColor(achievement.rarity)}>{achievement.rarity}</Badge>
                  <Badge variant="outline">{achievement.points} pts</Badge>
                </div>
                {!achievement.unlocked && (
                  <div className="space-y-2">
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
                    <p className="text-xs text-muted-foreground">
                      {achievement.progress}/{achievement.maxProgress}
                    </p>
                  </div>
                )}
                {achievement.unlocked && (
                  <Badge variant="default" className="bg-green-500">
                    <Trophy className="h-3 w-3 mr-1" />
                    Unlocked
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === "challenges" && (
        <div className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className={challenge.completed ? "opacity-75" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      {challenge.title}
                      <Badge className={getChallengeTypeColor(challenge.type)}>{challenge.type}</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-600 mb-1">
                      <Gift className="h-4 w-4" />
                      <span className="font-medium">{challenge.reward} pts</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatTimeRemaining(challenge.deadline)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progress</span>
                    <span className="text-sm font-medium">
                      {challenge.progress}/{challenge.maxProgress}
                    </span>
                  </div>
                  <Progress value={(challenge.progress / challenge.maxProgress) * 100} />
                </div>
                {challenge.completed && (
                  <Badge variant="default" className="bg-green-500 mt-3">
                    <Trophy className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
