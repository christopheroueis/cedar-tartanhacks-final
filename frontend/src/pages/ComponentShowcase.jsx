import RiskGauge from '../components/RiskGauge'
import DefaultComparison from '../components/DefaultComparison'
import Button from '../components/ui/Button'
import Input, { Select, Textarea } from '../components/ui/Input'
import Card, { CardWithHeader } from '../components/ui/Card'
import Badge, { ConfidenceBadge, RiskBadge } from '../components/ui/Badge'
import Skeleton, { SkeletonCard } from '../components/ui/Skeleton'
import { motion } from 'framer-motion'
import { staggerChildren, fadeInUp } from '../utils/animations'

/**
 * Component Showcase - Cedar Design System
 * Test page to verify all new components
 */

export default function ComponentShowcase() {
    return (
        <div className="min-h-screen p-8 bg-[var(--neutral-slate)]">
            <motion.div
                className="max-w-6xl mx-auto space-y-12"
                variants={staggerChildren}
                initial="initial"
                animate="animate"
            >
                {/* Header */}
                <motion.div variants={fadeInUp} className="text-center">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        🌲 Cedar Design System
                    </h1>
                    <p className="text-xl text-gray-400">
                        Professional, climate-smart lending platform
                    </p>
                </motion.div>

                {/* Color Palette */}
                <Card>
                    <h2 className="text-2xl font-semibold text-white mb-6">Color Palette</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="w-full h-20 rounded-lg bg-[#0A4D3C]"></div>
                            <p className="text-sm text-gray-400 mt-2">Cedar Green</p>
                            <p className="text-xs text-gray-600">#0A4D3C</p>
                        </div>
                        <div>
                            <div className="w-full h-20 rounded-lg bg-[#14B8A6]"></div>
                            <p className="text-sm text-gray-400 mt-2">Accent Teal</p>
                            <p className="text-xs text-gray-600">#14B8A6</p>
                        </div>
                        <div>
                            <div className="w-full h-20 rounded-lg bg-[#10B981]"></div>
                            <p className="text-sm text-gray-400 mt-2">Risk Low</p>
                            <p className="text-xs text-gray-600">#10B981</p>
                        </div>
                        <div>
                            <div className="w-full h-20 rounded-lg bg-[#F59E0B]"></div>
                            <p className="text-sm text-gray-400 mt-2">Risk Medium</p>
                            <p className="text-xs text-gray-600">#F59E0B</p>
                        </div>
                    </div>
                </Card>

                {/* Buttons */}
                <Card>
                    <h2 className="text-2xl font-semibold text-white mb-6">Buttons</h2>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="primary">Primary Button</Button>
                        <Button variant="secondary">Secondary Button</Button>
                        <Button variant="ghost">Ghost Button</Button>
                        <Button variant="danger">Danger Button</Button>
                        <Button variant="primary" loading>Loading...</Button>
                        <Button variant="primary" disabled>Disabled</Button>
                    </div>
                </Card>

                {/* Inputs */}
                <Card>
                    <h2 className="text-2xl font-semibold text-white mb-6">Form Inputs</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Input
                            label="Client Name"
                            placeholder="Enter name..."
                            helperText="Full legal name"
                        />
                        <Input
                            label="Loan Amount"
                            type="number"
                            placeholder="500"
                            icon={() => (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        />
                        <Select
                            label="Loan Purpose"
                            options={[
                                { value: 'agriculture', label: 'Agriculture' },
                                { value: 'livestock', label: 'Livestock' },
                                { value: 'business', label: 'Small Business' }
                            ]}
                        />
                        <Textarea
                            label="Notes"
                            placeholder="Additional information..."
                            helperText="Optional field"
                        />
                    </div>
                </Card>

                {/* Badges */}
                <Card>
                    <h2 className="text-2xl font-semibold text-white mb-6">Badges</h2>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="success">Success</Badge>
                        <Badge variant="warning">Warning</Badge>
                        <Badge variant="error">Error</Badge>
                        <Badge variant="info">Info</Badge>
                        <ConfidenceBadge level="high" />
                        <ConfidenceBadge level="medium" />
                        <ConfidenceBadge level="low" />
                        <RiskBadge level="low" />
                        <RiskBadge level="moderate" />
                        <RiskBadge level="high" />
                    </div>
                </Card>

                {/* Data Visualization */}
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <h2 className="text-2xl font-semibold text-white mb-6">Risk Gauge</h2>
                        <div className="flex justify-center">
                            <RiskGauge score={42} size="lg" />
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-2xl font-semibold text-white mb-6">Default Comparison</h2>
                        <DefaultComparison withoutClimate={37} withClimate={18} />
                    </Card>
                </div>

                {/* Loading States */}
                <Card>
                    <h2 className="text-2xl font-semibold text-white mb-6">Loading States</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Skeleton Card</h3>
                            <SkeletonCard rows={3} />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-3">Skeleton Elements</h3>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Card Variants */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card variant="elevated">
                        <h3 className="text-lg font-semibold text-white mb-2">Elevated Card</h3>
                        <p className="text-sm text-gray-400">Default professional card with proper elevation shadows</p>
                    </Card>

                    <Card variant="glass">
                        <h3 className="text-lg font-semibold text-white mb-2">Glass Card</h3>
                        <p className="text-sm text-gray-400">Use sparingly for special components</p>
                    </Card>

                    <Card variant="outline">
                        <h3 className="text-lg font-semibold text-white mb-2">Outline Card</h3>
                        <p className="text-sm text-gray-400">Minimal variant for secondary content</p>
                    </Card>
                </div>
            </motion.div>
        </div>
    )
}
