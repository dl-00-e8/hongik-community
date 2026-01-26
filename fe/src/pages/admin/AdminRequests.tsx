import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface ClubAdminRequest {
  id: string;
  user_id: string;
  club_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  admin_note: string | null;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
  clubs: {
    name: string;
  };
}

const AdminRequests = () => {
  const [selectedRequest, setSelectedRequest] = useState<ClubAdminRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('club_admin_requests')
        .select(`
          *,
          users (name, email),
          clubs (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ClubAdminRequest[];
    },
  });

  // Approve request mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note: string }) => {
      const { error } = await supabase.rpc('approve_club_admin_request', {
        request_id: requestId,
        note: note || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      toast({
        title: '승인 완료',
        description: '동아리 관리자 권한이 부여되었습니다.',
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: '승인 실패',
        description: error instanceof Error ? error.message : '승인에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });

  // Reject request mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, note }: { requestId: string; note: string }) => {
      const { error } = await supabase.rpc('reject_club_admin_request', {
        request_id: requestId,
        note: note || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      toast({
        title: '거부 완료',
        description: '신청이 거부되었습니다.',
      });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: '거부 실패',
        description: error instanceof Error ? error.message : '거부에 실패했습니다.',
        variant: 'destructive',
      });
    },
  });

  const openDialog = (request: ClubAdminRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setDialogType(type);
    setAdminNote('');
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogType(null);
    setAdminNote('');
  };

  const handleConfirm = () => {
    if (!selectedRequest) return;

    if (dialogType === 'approve') {
      approveMutation.mutate({
        requestId: selectedRequest.id,
        note: adminNote,
      });
    } else if (dialogType === 'reject') {
      rejectMutation.mutate({
        requestId: selectedRequest.id,
        note: adminNote,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기 중</Badge>;
      case 'approved':
        return <Badge variant="default">승인</Badge>;
      case 'rejected':
        return <Badge variant="destructive">거부</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const pendingRequests = requests?.filter((r) => r.status === 'pending') || [];
  const processedRequests = requests?.filter((r) => r.status !== 'pending') || [];

  return (
    <Layout>
      <div className="container py-8 max-w-6xl">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">동아리 관리자 신청 승인</CardTitle>
            <CardDescription>
              대기 중인 동아리 관리자 신청을 검토하고 승인/거부할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                대기 중인 신청이 없습니다.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>신청자</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>동아리</TableHead>
                    <TableHead>신청 메시지</TableHead>
                    <TableHead>신청일</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.users.name}</TableCell>
                      <TableCell>{request.users.email}</TableCell>
                      <TableCell>{request.clubs.name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.message || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => openDialog(request, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openDialog(request, 'reject')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            거부
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>처리된 신청</CardTitle>
              <CardDescription>
                승인 또는 거부된 신청 내역입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>신청자</TableHead>
                    <TableHead>동아리</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>관리자 메모</TableHead>
                    <TableHead>처리일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.users.name}</TableCell>
                      <TableCell>{request.clubs.name}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.admin_note || '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={dialogType !== null} onOpenChange={closeDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogType === 'approve' ? '신청 승인' : '신청 거부'}
              </DialogTitle>
              <DialogDescription>
                {dialogType === 'approve'
                  ? `${selectedRequest?.users.name}님을 ${selectedRequest?.clubs.name} 동아리의 관리자로 승인하시겠습니까?`
                  : `${selectedRequest?.users.name}님의 신청을 거부하시겠습니까?`}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium">관리자 메모 (선택사항)</label>
              <Textarea
                placeholder={
                  dialogType === 'approve'
                    ? '승인 사유나 전달 사항을 입력하세요'
                    : '거부 사유를 입력하세요'
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>
                취소
              </Button>
              <Button
                variant={dialogType === 'approve' ? 'default' : 'destructive'}
                onClick={handleConfirm}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {approveMutation.isPending || rejectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    처리 중...
                  </>
                ) : dialogType === 'approve' ? (
                  '승인'
                ) : (
                  '거부'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminRequests;
