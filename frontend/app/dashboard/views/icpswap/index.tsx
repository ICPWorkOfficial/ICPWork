
import React, { useEffect, useState } from 'react'
import {
	ChevronDownIcon,
	ArrowDownIcon,
	ArrowUpIcon,
	RefreshCwIcon,
} from 'lucide-react'

interface TabNavigationProps {
	activeTab: string
	setActiveTab: (tab: string) => void
}

export function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
	const tabs = [
    {
      id: 'swap',
      label: 'Swap',
    },
    {
      id: 'liquidity',
      label: 'Liquidity',
    },
    {
      id: 'earn',
      label: 'Earn',
    },
    {
      id: 'bridge',
      label: 'ck-bridge',
    },
    {
      id: 'info',
      label: 'Info',
    },
    {
      id: 'more',
      label: 'More',
      hasDropdown: true,
    },
  ]

	return (
		 <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-6 py-2 rounded-full flex items-center gap-1 whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-[#8055fa] via-[#ff5b79] to-[#fdb131] text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          {tab.label}
          {tab.hasDropdown && <ChevronDownIcon size={16} />}
        </button>
      ))}
    </div>
	)
}

export function SwapInterface() {
	const [activeTab, setActiveTab] = useState('swap')
	const [activeToggle, setActiveToggle] = useState('pending')

	// demo state
	const [transactions, setTransactions] = useState<any[]>([])
	const [conversion, setConversion] = useState<{ rate: number; converted: number } | null>(null)
	const [loading, setLoading] = useState(false)

	const fetchTransactions = async () => {
		try {
			const res = await fetch('/api/icpswap/transactions', { credentials: 'same-origin' })
			if (!res.ok) {
				setTransactions([])
				return
			}
			const data = await res.json()
			setTransactions(data.transactions || (Array.isArray(data) ? data : []))
		} catch (e) {
			console.error('fetch transactions', e)
		}
	}

	useEffect(() => {
		fetchTransactions()
	}, [])

	const convertApi = async (payload: { from: string; to: string; amount: string }) => {
		setLoading(true)
		try {
			const res = await fetch('/api/icpswap/convert', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(payload),
			})
			if (!res.ok) {
				const text = await res.text().catch(() => '');
				console.error('convertApi failed', res.status, text)
				return null
			}
			const data = await res.json()
			setConversion({ rate: data.rate ?? data.exchangeRate ?? null, converted: data.converted ?? data.amountConverted ?? null })
			return data
		} finally {
			setLoading(false)
		}
	}

	const createTransaction = async (payload: any) => {
		try {
			const res = await fetch('/api/icpswap/transactions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(payload),
			})
			if (!res.ok) {
				const text = await res.text().catch(() => '')
				console.error('createTransaction failed', res.status, text)
				return null
			}
			const data = await res.json()
			await fetchTransactions()
			return data
		} catch (e) {
			console.error(e)
		}
	}

	return (
		<div className="mt-6">
			<h1 className="text-2xl font-bold text-[#111111] mb-4">ICP Work Swap</h1>
			<TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
			<div className="mt-8">
				<SwapForm
					onConvert={convertApi}
					onCreateTransaction={createTransaction}
					conversion={conversion}
					loading={loading}
				/>
			</div>
			<div className="mt-10">
				<PendingHistoryToggle activeToggle={activeToggle} setActiveToggle={setActiveToggle} />
			</div>

			{/* Transactions list */}
			<div className="mt-6 max-w-3xl mx-auto">
				{activeToggle === 'pending' ? (
					<div>
						<h3 className="text-lg font-medium mb-2">Pending</h3>
						{transactions.filter((t) => t.status === 'pending').length === 0 && (
							<div className="text-sm text-gray-500">No pending transactions</div>
						)}
						<div className="space-y-3 mt-3">
							{transactions
								.filter((t) => t.status === 'pending')
								.map((t) => (
									<div key={t.id} className="p-3 bg-white rounded-lg border border-gray-100">
										<div className="flex justify-between">
											<div className="font-medium">{t.from} → {t.to}</div>
											<div className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
										</div>
										<div className="text-sm text-gray-700">Sent: {t.amount} → {t.converted}</div>
									</div>
								))}
						</div>
					</div>
				) : (
					<div>
						<h3 className="text-lg font-medium mb-2">History</h3>
						{transactions.filter((t) => t.status === 'done').length === 0 && (
							<div className="text-sm text-gray-500">No history yet</div>
						)}
						<div className="space-y-3 mt-3">
							{transactions
								.filter((t) => t.status === 'done')
								.map((t) => (
									<div key={t.id} className="p-3 bg-white rounded-lg border border-gray-100">
										<div className="flex justify-between">
											<div className="font-medium">{t.from} → {t.to}</div>
											<div className="text-sm text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
										</div>
										<div className="text-sm text-gray-700">Sent: {t.amount} → {t.converted}</div>
									</div>
								))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export function SwapForm({ onConvert, onCreateTransaction, conversion, loading }: any) {
	const [fromCrypto, setFromCrypto] = useState('ETH')
	const [toCrypto, setToCrypto] = useState('EOS')
	const [fromAmount, setFromAmount] = useState('')
	const [toAmount, setToAmount] = useState('')

	const [rateResult, setRateResult] = useState<number | null>(null)

	useEffect(() => {
		if (conversion) {
			setRateResult(conversion.converted)
		}
	}, [conversion])

	const handleConvert = async () => {
		if (!onConvert) return
		const res = await onConvert({ from: fromCrypto, to: toCrypto, amount: fromAmount })
		if (res && res.converted) setToAmount(String(res.converted))
	}

	const handleCreateTx = async () => {
		if (!onCreateTransaction) return
		const payload = { from: fromCrypto, to: toCrypto, amount: fromAmount, converted: toAmount }
		await onCreateTransaction(payload)
		// reset inputs
		setFromAmount('')
		setToAmount('')
	}

	return (
		<div className="bg-[#f7f7f7] rounded-3xl p-6 max-w-3xl mx-auto">
			<div className="flex items-center gap-2 mb-2">
				<div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 ">
					<RefreshCwIcon size={14} />
				</div>
				<span className="text-gray-500">Swap</span>
				<span className="text-black font-medium">Limit</span>
			</div>
			<div className="text-gray-500 text-sm mb-6">
				Transfer your tokens from one network to another.
			</div>
			<div className="flex justify-end gap-4 mb-4">
				<button className="p-1" aria-label="chart">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M8 21H12M16 21H12M12 21V3M12 3L5 10M12 3L19 10"
							stroke="#64748B"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<button className="p-1" aria-label="docs">
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M3 6H5M5 6H21M5 6V20C5 20.5304 5.21071 21.0391 5.58579 21.4142C5.96086 21.7893 6.46957 22 7 22H17C17.5304 22 18.0391 21.7893 18.4142 21.4142C18.7893 21.0391 19 20.5304 19 20V6H5Z"
							stroke="#64748B"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
						<path
							d="M9 11V17M15 11V17M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6"
							stroke="#64748B"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
						<select value={fromCrypto} onChange={(e) => setFromCrypto(e.target.value)} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-600">
							<option>ETH</option>
							<option>BTC</option>
							<option>ICP</option>
							<option>EOS</option>
						</select>
			</div>
			{/* From Crypto */}
			<div className="bg-white rounded-xl p-4 mb-4">
				<div className="flex justify-between mb-4">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16Z"
									fill="#627EEA"
								/>
								<path
									d="M8.24902 2V6.435L11.9975 8.11L8.24902 2Z"
									fill="white"
									fillOpacity="0.602"
								/>
								<path d="M8.249 2L4.5 8.11L8.249 6.435V2Z" fill="white" />
								<path
									d="M8.24902 10.984V13.9975L12 8.80604L8.24902 10.984Z"
									fill="white"
									fillOpacity="0.602"
								/>
								<path
									d="M8.249 13.9975V10.9835L4.5 8.80604L8.249 13.9975Z"
									fill="white"
								/>
								<path
									d="M8.24902 10.2855L11.9975 8.10604L8.24902 6.43604V10.2855Z"
									fill="white"
									fillOpacity="0.2"
								/>
								<path
									d="M4.5 8.10604L8.249 10.2855V6.43604L4.5 8.10604Z"
									fill="white"
									fillOpacity="0.602"
								/>
							</svg>
						</div>
						<div className="font-medium">{fromCrypto}</div>
						<ChevronDownIcon size={16} />
					</div>
					  <input type="text" placeholder="0.00" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} className="text-right text-2xl font-medium bg-transparent outline-none w-1/2" />
				</div>
				<div className="flex justify-between text-sm text-gray-500">
					<div>Balance: 2.8989 {fromCrypto}</div>
					<div>≈$6726.2307</div>
				</div>
			</div>
			{/* Swap Direction Button */}
			<div className="flex justify-center -my-4 relative z-10">
				<button className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center">
					<div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
						<ArrowUpIcon size={14} className="text-[#8055fa]" />
						<ArrowDownIcon size={14} className="text-[#ff5b79]" />
					</div>
				</button>
			</div>
			{/* To Crypto */}
			<div className="bg-white rounded-xl p-4 mb-6">
				<div className="flex justify-between mb-4">
					  <div className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
							<svg
								width="16"
								height="16"
								viewBox="0 0 16 16"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<circle cx="8" cy="8" r="8" fill="black" />
								<path
									d="M8.00002 3L7.99438 3.01966V10.1636L8.00002 10.1692L11.1613 8.42966L8.00002 3Z"
									fill="white"
								/>
								<path
									d="M8.00016 3L4.83887 8.42966L8.00016 10.1692V6.83328V3Z"
									fill="white"
									fillOpacity="0.8"
								/>
								<path
									d="M8.00002 10.8426L7.9967 10.8467V12.6393L8.00002 12.6496L11.1639 9.10303L8.00002 10.8426Z"
									fill="white"
								/>
								<path
									d="M8.00016 12.6496V10.8426L4.83887 9.10303L8.00016 12.6496Z"
									fill="white"
									fillOpacity="0.8"
								/>
								<path
									d="M8 10.1692L11.1613 8.42969L8 6.83332V10.1692Z"
									fill="white"
									fillOpacity="0.6"
								/>
								<path
									d="M4.83887 8.42969L8.00016 10.1692V6.83332L4.83887 8.42969Z"
									fill="white"
									fillOpacity="0.5"
								/>
							</svg>
						</div>
									<select value={toCrypto} onChange={(e) => setToCrypto(e.target.value)} className="font-medium bg-transparent">
										<option>EOS</option>
										<option>ETH</option>
										<option>ICP</option>
										<option>BTC</option>
									</select>
					</div>
					  <input type="text" placeholder="0.00" value={toAmount} onChange={(e) => setToAmount(e.target.value)} className="text-right text-2xl font-medium bg-transparent outline-none w-1/2" />
				</div>
				<div className="flex justify-between text-sm text-gray-500">
					<div>Balance: 400.8989 {toCrypto}</div>
					<div>≈$284.6382</div>
				</div>
			</div>
			{/* Rate Info */}
			<div className="mb-2">
				<div className="flex justify-between items-center mb-2">
					<div className="text-gray-600">When 1 ICP =</div>
					<button className="p-1">
						<RefreshCwIcon size={16} className="text-gray-600" />
					</button>
				</div>
				<div className="flex justify-between items-center">
					<div className="text-2xl font-semibold">400.8989 EOS</div>
					<div className="flex items-center gap-1 bg-black text-white py-1 px-2 rounded-full text-xs">
						<svg
							width="12"
							height="12"
							viewBox="0 0 16 16"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<circle cx="8" cy="8" r="8" fill="black" />
							<path
								d="M8.00002 3L7.99438 3.01966V10.1636L8.00002 10.1692L11.1613 8.42966L8.00002 3Z"
								fill="white"
							/>
							<path
								d="M8.00016 3L4.83887 8.42966L8.00016 10.1692V6.83328V3Z"
								fill="white"
								fillOpacity="0.8"
							/>
							<path
								d="M8.00002 10.8426L7.9967 10.8467V12.6393L8.00002 12.6496L11.1639 9.10303L8.00002 10.8426Z"
								fill="white"
							/>
							<path
								d="M8.00016 12.6496V10.8426L4.83887 9.10303L8.00016 12.6496Z"
								fill="white"
								fillOpacity="0.8"
							/>
							<path
								d="M8 10.1692L11.1613 8.42969L8 6.83332V10.1692Z"
								fill="white"
								fillOpacity="0.6"
							/>
							<path
								d="M4.83887 8.42969L8.00016 10.1692V6.83332L4.83887 8.42969Z"
								fill="white"
								fillOpacity="0.5"
							/>
						</svg>
						EOS
					</div>
				</div>
			</div>
					{/* Percentage Buttons */}
					<div className="flex gap-2 mb-4">
						<button onClick={() => setFromAmount((prev) => String((parseFloat(prev || '0') || 0) + 0.001))} className="px-3 py-1.5 bg-[#eeeeff] text-[#8055fa] text-xs rounded-lg">+0.001</button>
						<button onClick={() => setFromAmount((prev) => String((parseFloat(prev || '0') || 0) * 1.1))} className="px-3 py-1.5 bg-white border border-gray-200 text-xs rounded-lg">+10%</button>
						<button onClick={() => setFromAmount((prev) => String((parseFloat(prev || '0') || 0) * 1.2))} className="px-3 py-1.5 bg-white border border-gray-200 text-xs rounded-lg">+20%</button>
						<button onClick={() => setFromAmount((prev) => String((parseFloat(prev || '0') || 0) * 1.5))} className="px-3 py-1.5 bg-white border border-gray-200 text-xs rounded-lg">+50%</button>
					</div>
			{/* Conversion Rate */}
			<div className="text-sm text-gray-500 mb-6">1 EOS = 0.0003064ETH</div>
					<div className="flex gap-3">
						<button onClick={handleConvert} disabled={loading} className="flex-1 py-3 rounded-xl bg-[#f0f4ff] text-[#234]">{loading ? 'Converting...' : 'Get Rate'}</button>
						<button onClick={handleCreateTx} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#8055fa] via-[#ff5b79] to-[#fdb131] text-white font-medium">Create Tx</button>
					</div>
		</div>
	)
}

interface PendingHistoryToggleProps {
	activeToggle: string
	setActiveToggle: (toggle: string) => void
}
export function PendingHistoryToggle({
	activeToggle,
	setActiveToggle,
}: PendingHistoryToggleProps) {
	return (
		<div className="inline-flex rounded-full p-1 bg-white border border-gray-200">
			<button
				onClick={() => setActiveToggle('pending')}
				className={`px-6 py-2 rounded-full text-sm ${activeToggle === 'pending' ? 'bg-gradient-to-r from-[#8055fa] via-[#ff5b79] to-[#fdb131] text-white' : 'text-gray-600'}`}
			>
				Pending
			</button>
			<button
				onClick={() => setActiveToggle('history')}
				className={`px-6 py-2 rounded-full text-sm ${activeToggle === 'history' ? 'bg-gradient-to-r from-[#8055fa] via-[#ff5b79] to-[#fdb131] text-white' : 'text-gray-600'}`}
			>
				History
			</button>
		</div>
	)
}

export default SwapInterface
