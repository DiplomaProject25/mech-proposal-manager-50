
  // Update downloadProposalAsWord to include delivery times
  const downloadProposalAsWord = (proposalId: string) => {
    try {
      // Find the order with the given proposal
      const order = orders.find(o => o.commercialProposal?.id === proposalId);
      
      if (!order || !order.commercialProposal) {
        throw new Error('Предложение не найдено');
      }
      
      const proposal = order.commercialProposal;
      
      // Create HTML content for Word document
      let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset="utf-8">
          <title>Коммерческое предложение</title>
        </head>
        <body>
          <h1 style="text-align:center;">КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h1>
          <p><b>Дата:</b> ${proposal.createdAt.toLocaleDateString()}</p>
          <p><b>Клиент:</b> ${order.clientName}</p>
          <p><b>Номер заказа:</b> ${order.id}</p>
          <p><b>Описание:</b> ${order.description}</p>
          
          <h2>Спецификация</h2>
          
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: center;">№</th>
              <th style="padding: 8px; text-align: center;">Наименование</th>
              <th style="padding: 8px; text-align: center;">Кол-во</th>
              <th style="padding: 8px; text-align: center;">Срок доставки</th>
      `;
      
      if (proposal.showPrices) {
        htmlContent += `
              <th style="padding: 8px; text-align: center;">Цена за ед. без НДС ($)</th>
              <th style="padding: 8px; text-align: center;">Сумма без НДС ($)</th>
              <th style="padding: 8px; text-align: center;">НДС 20% ($)</th>
              <th style="padding: 8px; text-align: center;">Сумма с НДС ($)</th>
        `;
      }
      
      htmlContent += `</tr>`;
      
      let subtotalWithoutVAT = 0;
      
      proposal.equipment.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        const vat = itemTotal * 0.2;
        const totalWithVAT = itemTotal + vat;
        
        subtotalWithoutVAT += itemTotal;
        
        htmlContent += `
          <tr>
            <td style="padding: 8px; text-align: center;">${index + 1}</td>
            <td style="padding: 8px;">${item.name} (${item.articleNumber})</td>
            <td style="padding: 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; text-align: center;">${item.deliveryTime || "7-10 дней"}</td>
        `;
        
        if (proposal.showPrices) {
          htmlContent += `
            <td style="padding: 8px; text-align: right;">${item.price.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${itemTotal.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${vat.toFixed(2)}</td>
            <td style="padding: 8px; text-align: right;">${totalWithVAT.toFixed(2)}</td>
          `;
        }
        
        htmlContent += `</tr>`;
      });
      
      if (proposal.showPrices) {
        const totalVAT = subtotalWithoutVAT * 0.2;
        const totalWithVAT = subtotalWithoutVAT + totalVAT;
        const companyMarkupAmount = proposal.companyMarkup ? subtotalWithoutVAT * (proposal.companyMarkup / 100) : 0;
        const markupAmount = subtotalWithoutVAT * (proposal.markup / 100);
        
        htmlContent += `
          <tr style="font-weight: bold; background-color: #f2f2f2;">
            <td colspan="4" style="padding: 8px; text-align: right;">Итого без наценок:</td>
            <td colspan="${proposal.showPrices ? 4 : 1}" style="padding: 8px; text-align: right;">${subtotalWithoutVAT.toFixed(2)}</td>
          </tr>
        `;
        
        htmlContent += `
          </table>
          <p><b>Наценка (${proposal.markup}%):</b> $${markupAmount.toFixed(2)}</p>
        `;

        if (proposal.companyMarkup) {
          htmlContent += `
            <p><b>Наценка для предприятия (${proposal.companyMarkup}%):</b> $${companyMarkupAmount.toFixed(2)}</p>
          `;
        }

        htmlContent += `
          <p><b>НДС (20%):</b> $${totalVAT.toFixed(2)}</p>
          <p><b>ИТОГО с НДС:</b> $${proposal.totalCost.toFixed(2)}</p>
        `;
      } else {
        htmlContent += `</table>`;
      }
      
      if (proposal.responsibleEmployee) {
        htmlContent += `<p><b>Ответственный сотрудник:</b> ${proposal.responsibleEmployee}</p>`;
      }
      
      htmlContent += `
        <p style="margin-top: 30px; text-align: center;">Благодарим за сотрудничество!</p>
        </body>
        </html>
      `;
      
      // Convert to Blob
      const blob = new Blob([htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `КП_${proposalId}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Предложение загружено',
        description: 'Коммерческое предложение загружено в формате Word',
      });
    } catch (err) {
      setError('Не удалось загрузить предложение');
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить предложение',
        variant: 'destructive',
      });
    }
  };
