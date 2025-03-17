
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { transactions } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Transactions = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(transaction.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current transactions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('transactions')}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('add_transaction')}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('all_transactions')}</CardTitle>
          <CardDescription>
            {t('view_and_manage_your_financial_activities')}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('search_transactions')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto w-full">
              <Filter className="mr-2 h-4 w-4" /> {t('filter')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentTransactions.length > 0 ? (
            <>
              <TransactionList transactions={currentTransactions} />
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => paginate(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => 
                        paginate(Math.min(
                          Math.ceil(filteredTransactions.length / itemsPerPage), 
                          currentPage + 1
                        ))
                      }
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('no_transactions_found')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
