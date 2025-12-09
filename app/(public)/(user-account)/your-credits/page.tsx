import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Progress } from '@/components/ui/progress'
import { getCreditBalance } from '@/lib/get-credit-balance'
import { ExternalLink, MinusCircle, MoreHorizontal, Receipt, ShoppingCart } from 'lucide-react'

import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 10

export default async function YourCredits() {
  const {
    transactions,
    currentBalance,
    totalPurchased,
    latestPurchase,
    progressValue,
    percentageNotUsed,
  } = await getCreditBalance()

  return (
    <div className='flex flex-col items-center gap-4 mx-auto w-full max-w-4xl'>
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='flex justify-between items-center'>
            <span>Your Credit Balance </span>
          </CardTitle>
          <CardDescription>Your current balance, see your history below</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground mb-2'>Current Balance</p>
            <p className='text-xl font-bold'>{currentBalance} credits remaining</p>
          </div>

          <div>
            <p className='text-sm text-muted-foreground mb-2'>
              Total Credits Purchased (incl. 10 free)
            </p>
            <p className='text-xl font-bold'>
              {totalPurchased} (latest purchase: {latestPurchase?.credit_amount})
            </p>
          </div>

          <div>
            <p className='text-sm text-muted-foreground mb-2'>
              Credits remaining from Latest Purchase
            </p>
            <Progress value={percentageNotUsed} className='h-2' />
            <p className='text-sm text-muted-foreground mt-1'>{percentageNotUsed}% remaining</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className='w-full'>
            <Link href='/buy-credits'>Buy more credits </Link>
          </Button>
        </CardFooter>
      </Card>
      <Card className='w-full mt-8'>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Overview of your credit purchases and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='relative overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell className='flex items-center gap-4'>
                      {transaction.transaction_type === 'purchase' ? (
                        <>
                          <ShoppingCart className='h-4 w-4 text-green-500' />
                          <span>Purchase</span>
                        </>
                      ) : (
                        <>
                          <MinusCircle className='h-4 w-4 text-red-500' />
                          <span>Used</span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{transaction.credit_amount} credits</TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreHorizontal className='h-4 w-4' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {transaction.transaction_type === 'purchase' ? (
                            <DropdownMenuItem>
                              <Link href={``} className='flex items-center'>
                                <Receipt className='h-4 w-4 mr-2' />
                                View Invoice
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              <Link href='#' className='flex items-center'>
                                <ExternalLink className='h-4 w-4 mr-2' />
                                View Item
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
